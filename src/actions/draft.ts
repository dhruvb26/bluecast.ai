"use server";

import { getServerAuthSession } from "@/server/auth";
import { eq, sql, and } from "drizzle-orm";
import { db } from "@/server/db";
import { getUser } from "./user";
import {
  users,
  accounts,
  sessions,
  drafts,
  ideas,
  verificationTokens,
} from "@/server/db/schema";

export type Draft = {
  id: string;
  name?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  scheduledFor?: Date;
  userId: string;
  status: string;
  linkedInId: string;
  timeZone?: string;
  documentUrn?: string;
  downloadUrl?: string;
};

export async function getDraft(draftId: string) {
  try {
    const user = await getUser();
    const userId = user.id;

    const draft = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, draftId), eq(drafts.userId, userId)))
      .limit(1);

    if (draft.length === 0) {
      throw new Error("No draft found with the given ID.");
    }
  } catch (error) {
    console.error("Error in getDraft:", error);
    throw error;
  }
}

export async function getDrafts(status?: string) {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        message: "User not authenticated",
        data: [],
      };
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

    return userDrafts as Draft[];
  } catch (error) {
    console.error("Error in getDrafts:", error);
    throw error;
  }
}
