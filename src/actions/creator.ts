"use server";

import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { creators } from "@/server/db/schema";
import { ServerActionResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

export type Creator = {
  id: string;
  profileUrl?: string;
  fullName?: string;
  profileImageUrl?: string;
  headline?: string;
  urn?: string;
};

export async function getCreator(
  creatorId: string
): Promise<ServerActionResponse<Creator>> {
  try {
    const creator = await db
      .select()
      .from(creators)
      .where(eq(creators.id, creatorId))
      .limit(1);

    if (creator.length === 0) {
      return { success: false, error: "No creator found with the given ID." };
    }

    return { success: true, data: creator[0] as Creator };
  } catch (error) {
    console.error("Error in getCreator:", error);
    return {
      success: false,
      error: "An error occurred while fetching the creator.",
    };
  }
}

export async function getAllCreators(): Promise<
  ServerActionResponse<Creator[]>
> {
  try {
    const allCreators = await db.select().from(creators);

    return { success: true, data: allCreators as Creator[] };
  } catch (error) {
    console.error("Error in getAllCreators:", error);
    return {
      success: false,
      error: "An error occurred while fetching all creators.",
    };
  }
}

export async function createCreator(
  creatorData: Omit<Creator, "id">
): Promise<ServerActionResponse<Creator>> {
  try {
    const newCreator = await db
      .insert(creators)
      .values({
        id: uuidv4(),
        ...creatorData,
      })
      .returning();

    if (newCreator.length === 0) {
      return { success: false, error: "Failed to create new creator." };
    }

    return { success: true, data: newCreator[0] as Creator };
  } catch (error) {
    console.error("Error in createCreator:", error);
    return {
      success: false,
      error: "An error occurred while creating the creator.",
    };
  }
}

export async function updateCreator(
  creatorId: string,
  updatedData: Partial<Omit<Creator, "id">>
): Promise<ServerActionResponse<Creator>> {
  try {
    const updatedCreator = await db
      .update(creators)
      .set(updatedData)
      .where(eq(creators.id, creatorId))
      .returning();

    if (updatedCreator.length === 0) {
      return { success: false, error: "No creator found with the given ID." };
    }

    return { success: true, data: updatedCreator[0] as Creator };
  } catch (error) {
    console.error("Error in updateCreator:", error);
    return {
      success: false,
      error: "An error occurred while updating the creator.",
    };
  }
}

export async function deleteCreator(
  creatorId: string
): Promise<ServerActionResponse<void>> {
  try {
    const result = await db.delete(creators).where(eq(creators.id, creatorId));

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteCreator:", error);
    return {
      success: false,
      error: "An error occurred while deleting the creator.",
    };
  }
}
