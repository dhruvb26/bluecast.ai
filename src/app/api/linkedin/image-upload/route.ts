import { NextResponse } from "next/server";
import { getLinkedInId, checkAccess, getUser } from "@/actions/user";
import { RouteHandlerResponse } from "@/types";
import { updateDraftField } from "@/actions/draft";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";

export async function POST(req: Request): Promise<
  NextResponse<
    RouteHandlerResponse<{
      imageUrn: string;
      downloadUrl: string;
    }>
  >
> {
  try {
    console.log("Starting image upload process");
    await checkAccess();
    console.log("Access checked");
    const linkedInId = await getLinkedInId();
    console.log("LinkedIn ID retrieved:", linkedInId);
    const formData = await req.formData();
    console.log("Form data parsed");
    const user = await getUser();
    const userId = user.id;
    console.log("User ID:", userId);

    const account = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .limit(1);
    const accessToken = account[0].access_token;
    console.log("Access token retrieved");

    console.log("Initializing upload with LinkedIn API");
    const initResponse = await fetch(
      "https://api.linkedin.com/rest/images?action=initializeUpload",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
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
      console.error("LinkedIn API error:", errorData);
      throw new Error(`LinkedIn API error: ${JSON.stringify(errorData)}`);
    }

    const initData = (await initResponse.json()) as {
      value: { uploadUrl: string; image: string };
    };
    const {
      value: { uploadUrl, image: imageUrn },
    } = initData;
    console.log("Upload initialized. Image URN:", imageUrn);

    const file = formData.get("file") as File;
    const postId = formData.get("postId") as string;
    console.log("File and postId retrieved from form data");

    if (!file) {
      console.error("No file provided");
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("Uploading file to LinkedIn");
    const uploadResponse = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "LinkedIn-Version": "202406",
        Authorization: `Bearer ${accessToken}`,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      console.error("Upload failed with status:", uploadResponse.status);
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
    console.log("File uploaded successfully");

    console.log("Polling for image status");
    let imageData: { status: string; downloadUrl: string } | null = null;
    let retries = 0;
    const maxRetries = 10;
    const retryInterval = 2000; // 2 seconds

    while (retries < maxRetries) {
      const getImageUrl = `https://api.linkedin.com/rest/images/${imageUrn}`;
      console.log(`Polling attempt ${retries + 1}/${maxRetries}`);
      const imageResponse = await fetch(getImageUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202406",
        },
      });

      if (!imageResponse.ok) {
        console.error("GET image failed with status:", imageResponse.status);
        throw new Error(
          `GET image failed with status: ${imageResponse.status}`
        );
      }

      imageData = (await imageResponse.json()) as {
        status: string;
        downloadUrl: string;
      };
      console.log("Image status:", imageData.status);

      if (imageData.status === "AVAILABLE") {
        console.log("Image is available");
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      retries++;
    }

    if (!imageData || imageData.status !== "AVAILABLE") {
      console.error("Image processing timed out or failed");
      throw new Error("Image processing timed out or failed");
    }

    if (postId) {
      console.log("Setting downloadURL for the post now!");
      await updateDraftField(postId, "downloadUrl", imageData.downloadUrl);
      await updateDraftField(postId, "documentUrn", imageUrn);
      console.log("Draft fields updated");
    }

    console.log("Image upload process completed successfully");
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
  } catch (err: any) {
    console.error("Error in image upload process:", err);
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
