import { NextResponse } from "next/server";
import { RouteHandlerResponse } from "@/types";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
export const maxDuration = 300; // Increased to 5 minutes for Vercel

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
  const startTime = Date.now();
  try {
    const { url, userId } = (await req.json()) as {
      postId: string;
      url: string;
      userId: string;
    };
    console.log("Received postId and url from request body");

    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    // Get account based on userId and workspaceId
    const conditions = [eq(accounts.userId, userId)];
    if (workspaceId) {
      conditions.push(eq(accounts.workspaceId, workspaceId));
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
      const retryInterval = 10000; // 10 seconds
      console.log("Checking video processing status");
      while (true) {
        console.log("Checking video status");
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
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }

      return { videoUrn, downloadUrl: videoDetails.downloadUrl };
    };

    const { videoUrn, downloadUrl } = await uploadProcess();
    const endTime = Date.now();
    const executionTime = (endTime - startTime) / 1000; // Convert to seconds
    console.log(`Total execution time: ${executionTime.toFixed(2)} seconds`);

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
