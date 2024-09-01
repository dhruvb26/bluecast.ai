import { NextResponse } from "next/server";
import { getAccessToken, getLinkedInId, checkAccess } from "@/actions/user";
import { RouteHandlerResponse } from "@/types";
import { updateDownloadUrl } from "@/actions/draft";

export async function POST(req: Request): Promise<
  NextResponse<
    RouteHandlerResponse<{
      imageUrn: string;
      downloadUrl: string;
    }>
  >
> {
  try {
    await checkAccess();
    const accessToken = await getAccessToken();
    const linkedInId = await getLinkedInId();

    const initResponse = await fetch(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
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
          },
        }),
      }
    );

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(errorData)}`);
    }

    const initData = (await initResponse.json()) as {
      value: { uploadUrl: string; image: string };
    };
    const {
      value: { uploadUrl, image: imageUrn },
    } = initData;

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    const uploadResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/octet-stream",
        "LinkedIn-Version": "202406",
        Authorization: `Bearer ${accessToken}`,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }

    // Poll for image status until it's AVAILABLE
    let imageData: { status: string; downloadUrl: string } | null = null;
    let retries = 0;
    const maxRetries = 10;
    const retryInterval = 2000; // 2 seconds

    while (retries < maxRetries) {
      const getImageUrl = `https://api.linkedin.com/rest/images/${imageUrn}`;
      const imageResponse = await fetch(getImageUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202406",
        },
      });

      if (!imageResponse.ok) {
        throw new Error(
          `GET image failed with status: ${imageResponse.status}`
        );
      }

      imageData = (await imageResponse.json()) as {
        status: string;
        downloadUrl: string;
      };

      if (imageData.status === "AVAILABLE") {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      retries++;
    }

    if (!imageData || imageData.status !== "AVAILABLE") {
      throw new Error("Image processing timed out or failed");
    }

    if (postId) {
      await updateDownloadUrl(postId, imageData.downloadUrl);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          imageUrn: imageUrn,
          downloadUrl: imageData.downloadUrl,
        },
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json(
      {
        success: false,
        error,
      },
      { status: 500 }
    );
  }
}
