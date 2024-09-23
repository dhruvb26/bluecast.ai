"use server";

import { eq, and } from "drizzle-orm";
import { db } from "@/server/db";
import { getUser } from "./user";
import { drafts } from "@/server/db/schema";
import { ServerActionResponse } from "@/types";
import { Descendant } from "slate";

export type Draft = {
  id: string;
  name: string;
  content?: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  userId: string;
  status: string;
  linkedInId?: string;
  documentTitle?: string;
  timeZone?: string;
  documentUrn?: string;
  downloadUrl?: string;
};

type DraftColumn = keyof typeof drafts._.columns;

export async function getDraft(
  draftId: string
): Promise<ServerActionResponse<Draft>> {
  try {
    const user = await getUser();
    const userId = user.id;

    const draft = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)))
      .limit(1);

    if (draft.length === 0) {
      return { success: false, error: "No draft found with the given ID." };
    }

    return { success: true, data: draft[0] as Draft };
  } catch (error) {
    console.error("Error in getDraft:", error);
    return {
      success: false,
      error: "An error occurred while fetching the draft.",
    };
  }
}

export async function getDrafts(
  status?: string
): Promise<ServerActionResponse<Draft[]>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    let query;

    switch (status) {
      case "saved":
        query = db
          .select()
          .from(drafts)
          .where(and(eq(drafts.userId, userId), eq(drafts.status, "saved")));
        break;
      case "scheduled":
        query = db
          .select()
          .from(drafts)
          .where(
            and(eq(drafts.userId, userId), eq(drafts.status, "scheduled"))
          );
        break;
      case "published":
        query = db
          .select()
          .from(drafts)
          .where(
            and(eq(drafts.userId, userId), eq(drafts.status, "published"))
          );
        break;
      default:
        query = db.select().from(drafts).where(eq(drafts.userId, userId));
        break;
    }

    const userDrafts = await query;

    return { success: true, data: userDrafts as Draft[] };
  } catch (error) {
    console.error("Error in getDrafts:", error);
    return {
      success: false,
      error: "An error occurred while fetching drafts.",
    };
  }
}

export async function deleteDraft(
  draftId: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;

    const result = await db
      .delete(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)));

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteDraft:", error);
    return {
      success: false,
      error: "An error occurred while deleting the draft.",
    };
  }
}
export async function updateDraftField<K extends keyof Draft>(
  draftId: string,
  field: K,
  value: Draft[K]
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;

    const result = await db
      .update(drafts)
      .set({ [field]: value, updatedAt: new Date() })
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)));

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in updateDraftField:", error);
    return {
      success: false,
      error: "An error occurred while updating the draft field.",
    };
  }
}

export async function getDraftField<K extends keyof Draft>(
  draftId: string,
  field: K
): Promise<ServerActionResponse<Draft[K]>> {
  try {
    const user = await getUser();
    const userId = user.id;

    const result = await db
      //@ts-ignore
      .select({ [field]: drafts[field] })
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)))
      .limit(1);

    if (result.length === 0) {
      return {
        success: false,
        error:
          "No draft found with the given ID or you don't have permission to access it.",
      };
    }

    return { success: true, data: result[0][field] as Draft[K] };
  } catch (error) {
    console.error("Error in getDraftField:", error);
    return {
      success: false,
      error: "An error occurred while retrieving the draft field.",
    };
  }
}

export async function removeDraftField<K extends keyof Draft>(
  draftId: string,
  field: K
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;

    const result = await db
      .update(drafts)
      .set({ [field]: null, updatedAt: new Date() })
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)));

    if (result.length === 0) {
      return {
        success: false,
        error:
          "No draft found with the given ID or you don't have permission to update it.",
      };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in removeDraftField:", error);
    return {
      success: false,
      error: "An error occurred while removing the draft field.",
    };
  }
}

export async function saveDraft(
  draftId: string,
  content: string | Descendant[]
): Promise<ServerActionResponse<Draft>> {
  try {
    const user = await getUser();
    const userId = user.id;

    let serializedContent: string;
    if (typeof content === "string") {
      try {
        JSON.parse(content);
        serializedContent = content;
      } catch {
        serializedContent = JSON.stringify([
          {
            type: "paragraph",
            children: [{ text: content }],
          },
        ]);
      }
    } else {
      serializedContent = JSON.stringify(content);
    }

    const existingDraft = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)))
      .limit(1);

    if (existingDraft.length > 0) {
      const updateResult = await db
        .update(drafts)
        .set({
          content: serializedContent,
          updatedAt: new Date(),
        })
        .where(eq(drafts.id, draftId))
        .returning();

      if (updateResult.length === 0) {
        return {
          success: false,
          error: "Failed to update draft",
        };
      }
      return {
        success: true,
        data: updateResult[0] as Draft,
      };
    } else {
      const insertResult = await db
        .insert(drafts)
        .values({
          id: draftId,
          status: "saved",
          userId: userId,
          content: serializedContent,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (insertResult.length === 0) {
        return {
          success: false,
          error: "Failed to create new draft",
        };
      }

      return {
        success: true,
        data: insertResult[0] as Draft,
      };
    }
  } catch (error) {
    console.error("Error saving draft:", error);
    return {
      success: false,
      error: "An error occurred while saving the draft.",
    };
  }
}
