"use server";

import { db } from "@/server/db";
import { contentStyles } from "@/server/db/schema";
import { getUser } from "./user";
import { eq, isNull } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { ServerActionResponse } from "@/types";

// Define the ContentStyle type
export type ContentStyle = {
  id: string;
  userId: string | null;
  creatorId: string | null;
  name: string;
  examples: string[];
  createdAt: Date;
  updatedAt: Date;
};

export async function saveContentStyle(
  id: string,
  name: string,
  examples: string[],
  isPublic: boolean
): Promise<ServerActionResponse<ContentStyle>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const newContentStyle = await db
      .insert(contentStyles)
      .values({
        id,
        userId: isPublic ? null : userId,
        name,
        examples,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return {
      success: true,
      data: newContentStyle[0] as ContentStyle,
    };
  } catch (error) {
    console.error("Error saving content style:", error);
    return {
      success: false,
      error: "Failed to save content style",
    };
  }
}

export async function getContentStyles(
  isPublic: boolean
): Promise<ServerActionResponse<ContentStyle[]>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    let userContentStyles;
    if (isPublic) {
      userContentStyles = await db
        .select()
        .from(contentStyles)
        .where(isNull(contentStyles.userId));
    } else {
      userContentStyles = await db
        .select()
        .from(contentStyles)
        .where(eq(contentStyles.userId, userId));
    }

    return {
      success: true,
      data: userContentStyles as ContentStyle[],
    };
  } catch (error) {
    console.error("Error fetching content styles:", error);
    return {
      success: false,
      error: "Failed to fetch content styles",
    };
  }
}

export async function getContentStyle(
  styleId: string
): Promise<ServerActionResponse<ContentStyle>> {
  try {
    const contentStyle = await db
      .select()
      .from(contentStyles)
      .where(eq(contentStyles.id, styleId))
      .limit(1);

    if (contentStyle.length === 0) {
      return {
        success: false,
        error: "Content style not found",
      };
    }

    return {
      success: true,
      data: contentStyle[0] as ContentStyle,
    };
  } catch (error) {
    console.error("Error fetching content style:", error);
    return {
      success: false,
      error: "Failed to fetch content style",
    };
  }
}

export async function deleteContentStyle(
  styleId: string
): Promise<ServerActionResponse<void>> {
  try {
    const deletedContentStyle = await db
      .delete(contentStyles)
      .where(eq(contentStyles.id, styleId))
      .returning();

    if (deletedContentStyle.length === 0) {
      return {
        success: false,
        error: "Content style not found or already deleted",
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting content style:", error);
    return {
      success: false,
      error: "Failed to delete content style",
    };
  }
}

export async function updateStyleExample(
  styleId: string,
  exampleIndex: number,
  newExample: string,
  action: "add" | "edit" | "delete"
): Promise<ServerActionResponse<ContentStyle>> {
  try {
    const user = await getUser();
    if (!user.id) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const existingStyle = await db
      .select()
      .from(contentStyles)
      .where(eq(contentStyles.id, styleId))
      .limit(1);

    if (existingStyle.length === 0) {
      return {
        success: false,
        error: "Content style not found",
      };
    }

    let updatedExamples = [...existingStyle[0].examples];

    switch (action) {
      case "add":
        updatedExamples.push(newExample);
        break;
      case "edit":
        if (exampleIndex >= 0 && exampleIndex < updatedExamples.length) {
          updatedExamples[exampleIndex] = newExample;
        } else {
          return {
            success: false,
            error: "Invalid example index",
          };
        }
        break;
      case "delete":
        if (exampleIndex >= 0 && exampleIndex < updatedExamples.length) {
          updatedExamples.splice(exampleIndex, 1);
        } else {
          return {
            success: false,
            error: "Invalid example index",
          };
        }
        break;
    }

    const updatedStyle = await db
      .update(contentStyles)
      .set({ examples: updatedExamples, updatedAt: new Date() })
      .where(eq(contentStyles.id, styleId))
      .returning();

    return {
      success: true,
      data: updatedStyle[0] as ContentStyle,
    };
  } catch (error) {
    console.error("Error updating style example:", error);
    return {
      success: false,
      error: "Failed to update style example",
    };
  }
}
