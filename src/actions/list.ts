"use server";

import { db } from "@/server/db";
import { creatorLists, creatorListItems, creators } from "@/server/db/schema";
import { getUser } from "./user";
import { eq, isNull, and } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { ServerActionResponse } from "@/types";
import { auth } from "@clerk/nextjs/server";

export type CreatorList = {
  id: string;
  name: string;
  userId: string | null;
  workspaceId?: string;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    creatorId: string;
    creator: {
      id: string;
      profileUrl: string;
      fullName: string;
      profileImageUrl: string;
      headline: string;
      urn: string;
    };
  }[];
};

export async function getCreatorLists(
  isPublic: boolean
): Promise<ServerActionResponse<CreatorList[]>> {
  try {
    const user = await getUser();
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!user.id) {
      return { success: false, error: "User not authenticated" };
    }

    let lists;
    if (isPublic) {
      lists = await db.query.creatorLists.findMany({
        where: isNull(creatorLists.userId),
        with: {
          items: {
            with: {
              creator: true,
            },
          },
        },
      });
    } else {
      const conditions = [];

      if (workspaceId) {
        conditions.push(eq(creatorLists.workspaceId, workspaceId));
      } else {
        conditions.push(isNull(creatorLists.workspaceId));
        conditions.push(eq(creatorLists.userId, user.id));
      }

      lists = await db.query.creatorLists.findMany({
        where: and(...conditions),
        with: {
          items: {
            with: {
              creator: true,
            },
          },
        },
      });
    }

    return { success: true, data: lists as CreatorList[] };
  } catch (error) {
    console.error("Error fetching creator lists:", error);
    return { success: false, error: "Failed to fetch creator lists" };
  }
}

export async function saveCreatorList(
  name: string,
  creatorIds: string[],
  isPublic: boolean
): Promise<ServerActionResponse<CreatorList>> {
  try {
    const user = await getUser();
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!user.id) {
      return { success: false, error: "User not authenticated" };
    }

    const listId = uuid();
    await db.insert(creatorLists).values({
      id: listId,
      name,
      userId: isPublic ? null : user.id,
      workspaceId: isPublic ? null : workspaceId,
    });

    for (const creatorId of creatorIds) {
      await db.insert(creatorListItems).values({
        id: uuid(),
        creatorListId: listId,
        creatorId,
      });
    }

    const newList = await db.query.creatorLists.findFirst({
      where: eq(creatorLists.id, listId),
      with: {
        items: {
          with: {
            creator: true,
          },
        },
      },
    });

    return { success: true, data: newList as CreatorList };
  } catch (error) {
    console.error("Error saving creator list:", error);
    return { success: false, error: "Failed to save creator list" };
  }
}

export async function deleteCreatorList(
  listId: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!user.id) {
      return { success: false, error: "User not authenticated" };
    }

    const conditions = [eq(creatorLists.id, listId), ,];

    if (workspaceId) {
      conditions.push(eq(creatorLists.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(creatorLists.workspaceId));
      conditions.push(eq(creatorLists.userId, user.id));
    }

    const deletedList = await db
      .delete(creatorLists)
      .where(and(...conditions))
      .returning();

    if (deletedList.length === 0) {
      return {
        success: false,
        error: "Creator list not found or already deleted",
      };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error deleting creator list:", error);
    return { success: false, error: "Failed to delete creator list" };
  }
}

export async function removeCreatorFromList(
  listId: string,
  creatorId: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!user.id) {
      return { success: false, error: "User not authenticated" };
    }

    const conditions = [eq(creatorLists.id, listId)];

    if (workspaceId) {
      conditions.push(eq(creatorLists.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(creatorLists.workspaceId));
      conditions.push(eq(creatorLists.userId, user.id));
    }

    // Check if the list belongs to the user
    const list = await db.query.creatorLists.findFirst({
      where: and(...conditions),
    });

    if (!list) {
      return { success: false, error: "List not found or unauthorized" };
    }

    // Remove the creator from the list
    const result = await db
      .delete(creatorListItems)
      .where(
        eq(creatorListItems.creatorListId, listId) &&
          eq(creatorListItems.creatorId, creatorId)
      );

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error removing creator from list:", error);
    return { success: false, error: "Failed to remove creator from list" };
  }
}
