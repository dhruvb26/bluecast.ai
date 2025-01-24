"use server";

import { db } from "@/server/db";
import { ideas } from "@/server/db/schema";
import { getUser } from "./user";
import { eq, and, isNull } from "drizzle-orm";
import { ServerActionResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";

// Define the Idea type
export type Idea = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  workspaceId?: string;
};

export async function saveIdea(
  id: string,
  content: string
): Promise<ServerActionResponse<Idea>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const conditions = [eq(ideas.id, id)];
    if (workspaceId) {
      conditions.push(eq(ideas.workspaceId, workspaceId));
    } else {
      conditions.push(eq(ideas.userId, userId));
      conditions.push(isNull(ideas.workspaceId));
    }

    const updatedIdea = await db
      .update(ideas)
      .set({
        content: content,
        updatedAt: new Date(),
      })
      .where(and(...conditions))
      .returning();

    if (updatedIdea.length === 0) {
      // If no idea was updated, create a new one
      const newIdea = await db
        .insert(ideas)
        .values({
          id: id,
          userId: userId,
          workspaceId: workspaceId,
          content: content,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      return {
        success: true,
        data: newIdea[0] as Idea,
      };
    }

    return {
      success: true,
      data: updatedIdea[0] as Idea,
    };
  } catch (error) {
    console.error("Error saving idea:", error);
    return {
      success: false,
      error: "Failed to save idea",
    };
  }
}

export async function getIdeas(): Promise<ServerActionResponse<Idea[]>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const conditions = [];
    if (workspaceId) {
      conditions.push(eq(ideas.workspaceId, workspaceId));
    } else {
      conditions.push(eq(ideas.userId, userId));
      conditions.push(isNull(ideas.workspaceId));
    }

    const userIdeas = await db
      .select()
      .from(ideas)
      .where(and(...conditions));

    return {
      success: true,
      data: userIdeas as Idea[],
    };
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return {
      success: false,
      error: "Failed to fetch ideas",
    };
  }
}

export async function deleteIdea(
  ideaId: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const conditions = [eq(ideas.id, ideaId)];
    if (workspaceId) {
      conditions.push(eq(ideas.workspaceId, workspaceId));
    } else {
      conditions.push(eq(ideas.userId, userId));
      conditions.push(isNull(ideas.workspaceId));
    }

    const deletedIdea = await db
      .delete(ideas)
      .where(and(...conditions))
      .returning();

    if (deletedIdea.length === 0) {
      return {
        success: false,
        error: "Idea not found or already deleted",
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting idea:", error);
    return {
      success: false,
      error: "Failed to delete idea",
    };
  }
}
