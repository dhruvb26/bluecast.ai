"use server";

import { db } from "@/server/db";
import { instructions } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { getUser } from "@/actions/user";
import { auth } from "@clerk/nextjs/server";
import { ServerActionResponse } from "@/types";

export type Instruction = {
  id: string;
  name: string;
  instructions: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  workspaceId?: string;
};

export async function createInstruction(
  name: string,
  instructionText: string
): Promise<ServerActionResponse<string>> {
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

    const id = uuid();
    await db.insert(instructions).values({
      id,
      userId,
      workspaceId,
      name,
      instructions: instructionText,
    });

    return {
      success: true,
      data: id,
    };
  } catch (error) {
    console.error("Error creating instruction:", error);
    return {
      success: false,
      error: "Failed to create instruction",
    };
  }
}

export async function getInstruction(
  id: string
): Promise<ServerActionResponse<Instruction>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    const conditions = [
      eq(instructions.id, id),
      eq(instructions.userId, userId),
    ];

    if (workspaceId) {
      conditions.push(eq(instructions.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(instructions.workspaceId));
    }

    const [instruction] = await db
      .select()
      .from(instructions)
      .where(and(...conditions));

    if (!instruction) {
      return {
        success: false,
        error: "Instruction not found",
      };
    }

    return {
      success: true,
      data: instruction as Instruction,
    };
  } catch (error) {
    console.error("Error getting instruction:", error);
    return {
      success: false,
      error: "Failed to get instruction",
    };
  }
}

export async function updateInstruction(
  id: string,
  name: string,
  instructionText: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    const conditions = [
      eq(instructions.id, id),
      eq(instructions.userId, userId),
    ];

    if (workspaceId) {
      conditions.push(eq(instructions.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(instructions.workspaceId));
    }

    await db
      .update(instructions)
      .set({ name, instructions: instructionText })
      .where(and(...conditions));

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error updating instruction:", error);
    return {
      success: false,
      error: "Failed to update instruction",
    };
  }
}

export async function deleteInstruction(
  id: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    const conditions = [
      eq(instructions.id, id),
      eq(instructions.userId, userId),
    ];

    if (workspaceId) {
      conditions.push(eq(instructions.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(instructions.workspaceId));
    }

    await db.delete(instructions).where(and(...conditions));

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting instruction:", error);
    return {
      success: false,
      error: "Failed to delete instruction",
    };
  }
}

export async function listInstructions(): Promise<
  ServerActionResponse<Instruction[]>
> {
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

    const conditions = [eq(instructions.userId, userId)];

    if (workspaceId) {
      conditions.push(eq(instructions.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(instructions.workspaceId));
    }

    const userInstructions = await db
      .select()
      .from(instructions)
      .where(and(...conditions));

    return {
      success: true,
      data: userInstructions as Instruction[],
    };
  } catch (error) {
    console.error("Error listing instructions:", error);
    return {
      success: false,
      error: "Failed to list instructions",
    };
  }
}
