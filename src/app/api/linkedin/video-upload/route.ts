import { NextResponse } from "next/server";
import { RouteHandlerResponse } from "@/types";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
export const maxDuration = 250;

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
    const { url, userId } = (await req.json()) as {
      postId: string;
      url: string;
      userId: string;
    };
    console.log("Received postId and url from request body");

    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);
    const accessToken = account[0].access_token;

    const linkedInId = await db
      .select({ providerAccountId: accounts.providerAccountId })
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), 250000)
    );

    const uploadProcess = async () => {
      // Fetch the file size first
      const fileResponse = await fetch(url, { method: "HEAD" });
      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch file from URL: ${url}`);
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
              owner: `urn:li:person:${linkedInId[0].providerAccountId}`,
              fileSizeBytes: fileSizeBytes,
              uploadCaptions: false,
              uploadThumbnail: false,
            },
          }),
        }
      );

      if (!initResponse.ok) {
        const errorText = await initResponse.text();
        console.error("LinkedIn API error:", errorText);
        throw new Error(`LinkedIn API error: ${errorText}`);
      }

      const {
        value: { uploadInstructions, video: videoUrn },
      } = (await initResponse.json()) as InitializeUploadResponse;
      console.log("Upload initialized, videoUrn:", videoUrn);

      // Fetch the file content
      const fileContentResponse = await fetch(url);
      if (!fileContentResponse.ok) {
        throw new Error(`Failed to fetch file content from URL: ${url}`);
      }
      const fileBuffer = await fileContentResponse.arrayBuffer();
      const uploadedPartIds: string[] = [];

      console.log("Starting chunk uploads");
      let uploadedBytes = 0;
      const totalBytes = fileBuffer.byteLength;
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
      const maxRetries = 150;
      const retryInterval = 5000;
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
    console.error("Error in POST handler: ", error);

    return NextResponse.json(
      { success: false, error: "An error occurred during video upload" },
      { status: 500 }
    );
  }
}
