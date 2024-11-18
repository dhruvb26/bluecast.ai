"use server";

import { db } from "@/server/db";
import { contentStyles } from "@/server/db/schema";
import { getUser } from "./user";
import { and, eq, isNull } from "drizzle-orm";
import { ServerActionResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";

// Define the ContentStyle type
export type ContentStyle = {
  id: string;
  userId: string | null;
  creatorId: string | null;
  name: string;
  examples: string[];
  createdAt: Date;
  updatedAt: Date;
  workspaceId?: string;
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

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
        workspaceId: isPublic ? null : workspaceId,
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

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
      const conditions = [eq(contentStyles.userId, userId)];

      if (workspaceId) {
        conditions.push(eq(contentStyles.workspaceId, workspaceId));
      } else {
        conditions.push(isNull(contentStyles.workspaceId));
      }

      userContentStyles = await db
        .select()
        .from(contentStyles)
        .where(and(...conditions));
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
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    const conditions = [eq(contentStyles.id, styleId)];

    if (!isNull(contentStyles.userId)) {
      conditions.push(eq(contentStyles.userId, userId));

      if (workspaceId) {
        conditions.push(eq(contentStyles.workspaceId, workspaceId));
      } else {
        conditions.push(isNull(contentStyles.workspaceId));
      }
    }

    const contentStyle = await db
      .select()
      .from(contentStyles)
      .where(and(...conditions))
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
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    const conditions = [
      eq(contentStyles.id, styleId),
      eq(contentStyles.userId, userId),
    ];

    if (workspaceId) {
      conditions.push(eq(contentStyles.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(contentStyles.workspaceId));
    }

    const deletedContentStyle = await db
      .delete(contentStyles)
      .where(and(...conditions))
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
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const conditions = [
      eq(contentStyles.id, styleId),
      eq(contentStyles.userId, userId),
    ];

    if (workspaceId) {
      conditions.push(eq(contentStyles.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(contentStyles.workspaceId));
    }

    const existingStyle = await db
      .select()
      .from(contentStyles)
      .where(and(...conditions))
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
      .where(and(...conditions))
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
