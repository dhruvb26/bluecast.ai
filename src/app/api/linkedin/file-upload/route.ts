import { NextResponse } from "next/server";
import { getLinkedInId, checkAccess, getUser } from "@/actions/user";
import { RouteHandlerResponse } from "@/types";
import { updateDraftField } from "@/actions/draft";
import { env } from "@/env";
import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";

export async function POST(req: Request): Promise<
  NextResponse<
    RouteHandlerResponse<{
      documentUrn: string;
      downloadUrl: string;
    }>
  >
> {
  try {
    await checkAccess();
    // const linkedInId = await getLinkedInId();

    const user = await getUser();
    const userId = user.id;

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
    const initResponse = await fetch(
      "https://api.linkedin.com/rest/documents?action=initializeUpload",
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
          },
        }),
      }
    );

    if (!initResponse.ok) {
      const errorData = await initResponse.json();
      throw new Error(`LinkedIn API error: ${JSON.stringify(errorData)}`);
    }

    const initData = (await initResponse.json()) as {
      value: { uploadUrl: string; document: string };
    };
    const {
      value: { uploadUrl, document: documentUrn },
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

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "File size exceeds 100MB limit" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported file type. Only PDF, PPTX, and DOCX are allowed",
        },
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

    // Poll for document status until it's AVAILABLE
    let documentData: { status: string; downloadUrl: string } | null = null;
    let retries = 0;
    const maxRetries = 10;
    const retryInterval = 2000; // 2 seconds

    while (retries < maxRetries) {
      const getDocumentUrl = `https://api.linkedin.com/rest/documents/${documentUrn}`;

      const documentResponse = await fetch(getDocumentUrl, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "LinkedIn-Version": "202406",
        },
      });

      if (!documentResponse.ok) {
        throw new Error(
          `GET document failed with status: ${documentResponse.status}`
        );
      }

      documentData = (await documentResponse.json()) as {
        status: string;
        downloadUrl: string;
      };

      if (documentData.status === "AVAILABLE") {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, retryInterval));
      retries++;
    }

    if (!documentData || documentData.status !== "AVAILABLE") {
      throw new Error("Document processing timed out or failed");
    }

    if (postId) {
      await updateDraftField(postId, "downloadUrl", documentData.downloadUrl);
      await updateDraftField(postId, "documentUrn", documentUrn);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          documentUrn: documentUrn,
          downloadUrl: documentData.downloadUrl,
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
