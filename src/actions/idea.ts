"use server";

import { db } from "@/server/db";
import { ideas } from "@/server/db/schema";
import { getUser } from "./user";
import { eq } from "drizzle-orm";
import { ServerActionResponse } from "@/types";

// Define the Idea type
export type Idea = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
};

export async function saveIdea(
  id: string,
  content: string
): Promise<ServerActionResponse<Idea>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const updatedIdea = await db
      .update(ideas)
      .set({
        content: content,
        updatedAt: new Date(),
      })
      .where(eq(ideas.id, id))
      .returning();

    if (updatedIdea.length === 0) {
      // If no idea was updated, create a new one
      const newIdea = await db
        .insert(ideas)
        .values({
          id: id,
          userId: userId,
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

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const userIdeas = await db
      .select()
      .from(ideas)
      .where(eq(ideas.userId, userId));

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

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const deletedIdea = await db
      .delete(ideas)
      .where(eq(ideas.id, ideaId))
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
