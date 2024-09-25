import { NextResponse } from "next/server";
import { getLinkedInId, checkAccess, getUser } from "@/actions/user";
import { updateDraftField } from "@/actions/draft";
import { RouteHandlerResponse } from "@/types";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";

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

export async function POST(
  req: Request
): Promise<
  NextResponse<RouteHandlerResponse<{ videoUrn: string; downloadUrl: string }>>
> {
  try {
    console.log("Starting POST request for video upload");
    await checkAccess();
    // const linkedInId = await getLinkedInId();
    const user = await getUser();
    const userId = user.id;
    console.log("User authenticated, userId:", userId);

    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);
    const accessToken = account[0].access_token;
    console.log("Retrieved access token for user");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;
    console.log("Received file and postId from form data");

    const linkedInId = await db
      .select({ providerAccountId: accounts.providerAccountId })
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);
    console.log("Retrieved LinkedIn ID:", linkedInId[0].providerAccountId);
    console.log("Initializing upload with LinkedIn API");
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), 100000)
    );

    const uploadProcess = async () => {
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
              owner: `urn:li:person:${linkedInId[0].providerAccountId}`,
              fileSizeBytes: file.size,
              uploadCaptions: false,
              uploadThumbnail: false,
            },
          }),
        }
      );

      if (!initResponse.ok) {
        console.error("LinkedIn API error:", await initResponse.text());
        throw new Error(`LinkedIn API error: ${await initResponse.text()}`);
      }

      const {
        value: { uploadInstructions, video: videoUrn },
      } = (await initResponse.json()) as InitializeUploadResponse;
      console.log("Upload initialized, videoUrn:", videoUrn);

      const fileBuffer = await file.arrayBuffer();
      const uploadedPartIds: string[] = [];

      console.log("Starting chunk uploads");
      let uploadedBytes = 0;
      const totalBytes = file.size;
      for (const { uploadUrl, firstByte, lastByte } of uploadInstructions) {
        const chunk = fileBuffer.slice(firstByte, lastByte + 1);
        console.log(`Uploading chunk: ${firstByte}-${lastByte}`);
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
          console.error("Upload failed with status:", uploadResponse.status);
          throw new Error(
            `Upload failed with status: ${uploadResponse.status}`
          );
        }

        const eTag = uploadResponse.headers.get("ETag");
        if (!eTag) throw new Error("ETag not found in upload response");
        uploadedPartIds.push(eTag.replace(/"/g, ""));
        uploadedBytes += lastByte - firstByte + 1;
        console.log(
          `Upload progress: ${((uploadedBytes / totalBytes) * 100).toFixed(2)}%`
        );
        console.log("Chunk uploaded successfully, ETag:", eTag);
      }

      console.log("All chunks uploaded, finalizing");

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
        console.error(
          "Finalize upload failed with status:",
          finalizeResponse.status
        );
        throw new Error(
          `Finalize upload failed with status: ${finalizeResponse.status}`
        );
      }

      let videoDetails: VideoDetails | null = null;
      const maxRetries = 50;
      const retryInterval = 2000;
      console.log("Checking video processing status");
      for (let i = 0; i < maxRetries; i++) {
        console.log(`Retry ${i + 1}: Checking video status`);
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
          console.error(
            "Failed to get video details:",
            videoDetailsResponse.status
          );
          throw new Error(
            `Failed to get video details: ${videoDetailsResponse.status}`
          );
        }

        videoDetails = (await videoDetailsResponse.json()) as VideoDetails;
        console.log("Video status:", videoDetails.status);
        if (videoDetails.status === "AVAILABLE") break;
        if (i < maxRetries - 1)
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }

      if (!videoDetails || videoDetails.status !== "AVAILABLE") {
        throw new Error("Video processing timed out or failed");
      }

      return { videoUrn, downloadUrl: videoDetails.downloadUrl };
    };

    const { videoUrn, downloadUrl } = (await Promise.race([
      uploadProcess(),
      timeoutPromise,
    ])) as { videoUrn: string; downloadUrl: string };

    return NextResponse.json({
      success: true,
      data: { videoUrn, downloadUrl },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
