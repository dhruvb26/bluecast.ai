import { task, logger } from "@trigger.dev/sdk/v3";
import { db } from "@/server/db";
import { accounts, drafts } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/env";

interface UploadInstruction {
  uploadUrl: string;
  firstByte: number;
  lastByte: number;
}

interface InitializeUploadResponse {
  value: {
    uploadInstructions: UploadInstruction[];
    video: string;
  };
}

interface VideoDetails {
  status: string;
  downloadUrl: string;
}

export const linkedinPost = task({
  id: `linkedin-post`,
  maxDuration: 400,
  run: async (
    payload: {
      userId: string;
      postId: string;
      workspaceId: string | null | undefined;
      url: string;
    },
    { ctx }
  ) => {
    logger.info("Processing payload", { payload });

    await db
      .update(drafts)
      .set({
        status: "progress",
      })
      .where(
        and(eq(drafts.id, payload.postId), eq(drafts.userId, payload.userId))
      );

    const conditions = [eq(accounts.userId, payload.userId)];
    if (payload.workspaceId) {
      conditions.push(eq(accounts.workspaceId, payload.workspaceId));
    } else {
      conditions.push(isNull(accounts.workspaceId));
    }

    const account = await db
      .select()
      .from(accounts)
      .where(and(...conditions))
      .limit(1);

    if (!account || account.length === 0) {
      throw new Error("No LinkedIn account found");
    }

    const accessToken = account[0].access_token;
    const linkedInId = account[0].providerAccountId;

    const uploadProcess = async () => {
      // Fetch the file size first
      const fileResponse = await fetch(payload.url, { method: "HEAD" });
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file from URL: ${payload.url}`);
      }
      const fileSizeBytes = parseInt(
        fileResponse.headers.get("Content-Length") || "0",
        10
      );
      if (fileSizeBytes === 0) {
        throw new Error("Invalid file size");
      }

      const initResponse = await fetch(
        "https://api.linkedin.com/rest/videos?action=initializeUpload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202406",
          },
          body: JSON.stringify({
            initializeUploadRequest: {
              owner: `urn:li:person:${linkedInId}`,
              fileSizeBytes: fileSizeBytes,
              uploadCaptions: false,
              uploadThumbnail: false,
            },
          }),
        }
      );

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        logger.error("LinkedIn API error", { error: errorText });
        throw new Error(`LinkedIn API error: ${errorText}`);
      }

      const {
        value: { uploadInstructions, video: videoUrn },
      } = (await initResponse.json()) as InitializeUploadResponse;
      logger.info("Upload initialized", { videoUrn });

      // Fetch the file content
      const fileContentResponse = await fetch(payload.url);
      if (!fileContentResponse.ok) {
        throw new Error(
          `Failed to fetch file content from URL: ${payload.url}`
        );
      }
      const fileBuffer = await fileContentResponse.arrayBuffer();
      const uploadedPartIds: string[] = [];

      logger.info("Starting chunk uploads");
      let uploadedBytes = 0;
      const totalBytes = fileBuffer.byteLength;
      for (const { uploadUrl, firstByte, lastByte } of uploadInstructions) {
        const chunk = fileBuffer.slice(firstByte, lastByte + 1);
        logger.info("Uploading chunk", { firstByte, lastByte });
        const uploadResponse = await fetch(uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": "application/octet-stream",
            "LinkedIn-Version": "202406",
            Authorization: `Bearer ${accessToken}`,
          },
          body: chunk,
        });

        if (!uploadResponse.ok) {
          logger.error("Upload failed", { status: uploadResponse.status });
          throw new Error(
            `Upload failed with status: ${uploadResponse.status}`
          );
        }

        const eTag = uploadResponse.headers.get("ETag");
        if (!eTag) throw new Error("ETag not found in upload response");
        uploadedPartIds.push(eTag.replace(/"/g, ""));
        uploadedBytes += lastByte - firstByte + 1;
        logger.info("Upload progress", {
          progress: `${((uploadedBytes / totalBytes) * 100).toFixed(2)}%`,
        });
        logger.info("Chunk uploaded successfully", { eTag });
      }

      logger.info("All chunks uploaded, finalizing");

      const finalizeResponse = await fetch(
        "https://api.linkedin.com/rest/videos?action=finalizeUpload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
            "LinkedIn-Version": "202406",
          },
          body: JSON.stringify({
            finalizeUploadRequest: {
              video: videoUrn,
              uploadToken: "",
              uploadedPartIds: uploadedPartIds,
            },
          }),
        }
      );

      if (!finalizeResponse.ok) {
        logger.error("Finalize upload failed", {
          status: finalizeResponse.status,
        });
        throw new Error(
          `Finalize upload failed with status: ${finalizeResponse.status}`
        );
      }

      let videoDetails: VideoDetails | null = null;
      const retryInterval = 10000; // 10 seconds
      logger.info("Checking video processing status");
      while (true) {
        logger.info("Checking video status");
        const videoDetailsResponse = await fetch(
          `https://api.linkedin.com/rest/videos/${encodeURIComponent(
            videoUrn
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              "X-Restli-Protocol-Version": "2.0.0",
              "LinkedIn-Version": "202406",
            },
          }
        );

        if (!videoDetailsResponse.ok) {
          logger.error("Failed to get video details", {
            status: videoDetailsResponse.status,
          });
          throw new Error(
            `Failed to get video details: ${videoDetailsResponse.status}`
          );
        }

        videoDetails = (await videoDetailsResponse.json()) as VideoDetails;
        logger.info("Video status updated", { status: videoDetails.status });
        if (videoDetails.status === "AVAILABLE") break;
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }

      return { videoUrn, downloadUrl: videoDetails.downloadUrl };
    };

    const { videoUrn, downloadUrl } = await uploadProcess();

    await db
      .update(drafts)
      .set({
        documentUrn: videoUrn,
        downloadUrl: downloadUrl,
        status: "published",
      })
      .where(
        and(eq(drafts.id, payload.postId), eq(drafts.userId, payload.userId))
      );

    await fetch(`${env.NEXT_PUBLIC_BASE_URL}/api/linkedin/post`, {
      method: "POST",
      body: JSON.stringify({
        postId: payload.postId,
        userId: payload.userId,
        workspaceId: payload.workspaceId,
      }),
    });
  },
});
