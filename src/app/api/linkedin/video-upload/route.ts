import { NextResponse } from "next/server";
import { getAccessToken, getLinkedInId, checkAccess } from "@/actions/user";
import { updateDownloadUrl } from "@/actions/draft";
import { RouteHandlerResponse } from "@/types";

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
    await checkAccess();
    const accessToken = await getAccessToken();
    const linkedInId = await getLinkedInId();

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;

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
            fileSizeBytes: file.size,
            uploadCaptions: false,
            uploadThumbnail: false,
          },
        }),
      }
    );

    if (!initResponse.ok) {
      throw new Error(`LinkedIn API error: ${await initResponse.text()}`);
    }

    const {
      value: { uploadInstructions, video: videoUrn },
    } = (await initResponse.json()) as InitializeUploadResponse;

    const fileBuffer = await file.arrayBuffer();
    const uploadedPartIds: string[] = [];

    for (const { uploadUrl, firstByte, lastByte } of uploadInstructions) {
      const chunk = fileBuffer.slice(firstByte, lastByte + 1);
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
        throw new Error(`Upload failed with status: ${uploadResponse.status}`);
      }

      const eTag = uploadResponse.headers.get("ETag");
      if (!eTag) throw new Error("ETag not found in upload response");
      uploadedPartIds.push(eTag.replace(/"/g, ""));
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));

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
      throw new Error(
        `Finalize upload failed with status: ${finalizeResponse.status}`
      );
    }

    let videoDetails: VideoDetails | null = null;
    let retries = 0;
    while (retries < 30) {
      const videoDetailsResponse = await fetch(
        `https://api.linkedin.com/rest/videos/${encodeURIComponent(videoUrn)}`,
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
        throw new Error(
          `Failed to get video details: ${videoDetailsResponse.status}`
        );
      }

      videoDetails = (await videoDetailsResponse.json()) as VideoDetails;
      if (videoDetails.status === "AVAILABLE") break;

      await new Promise((resolve) => setTimeout(resolve, 2000));
      retries++;
    }

    if (!videoDetails || videoDetails.status !== "AVAILABLE") {
      throw new Error("Video processing timed out or failed");
    }

    const { downloadUrl } = videoDetails;

    if (postId) {
      await updateDownloadUrl(postId, downloadUrl);
    }

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
