"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { getUser } from "./user";
import { workspaces } from "@/server/db/schema";
import { ServerActionResponse } from "@/types";
import { v4 as uuid } from "uuid";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";

export type Workspace = {
  id: string;
  name: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function createWorkspace(
  name: string
): Promise<ServerActionResponse<Workspace>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const monthlyGrowPlan =
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QLXONRrqqSKPUNW7s5FxANR"
        : "price_1QN9JoRrqqSKPUNWuTZBJWS1";

    const annualGrowPlan =
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QMOYXRrqqSKPUNWcFVWJIs4"
        : "price_1QN9NyRrqqSKPUNWWwB1zAXa";

    if (
      !user.priceId ||
      !user.stripeSubscriptionId ||
      (user.priceId !== monthlyGrowPlan && user.priceId !== annualGrowPlan)
    ) {
      return {
        success: false,
        error: "Upgrade to Grow Plan to create more workspaces.",
      };
    }

    const existingWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId));

    if (existingWorkspaces.length >= 2) {
      return {
        success: false,
        error: "You have reached the maximum number of workspaces.",
      };
    }

    const workspace = await db
      .insert(workspaces)
      .values({
        id: uuid(),
        name,
        userId,
      })
      .returning();

    return { success: true, data: workspace[0] as Workspace };
  } catch (error) {
    console.error("Error in createWorkspace:", error);
    return {
      success: false,
      error: "An error occurred while creating the workspace.",
    };
  }
}

export async function getWorkspaces(): Promise<
  ServerActionResponse<Workspace[]>
> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const userWorkspaces = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userId));

    return { success: true, data: userWorkspaces as Workspace[] };
  } catch (error) {
    console.error("Error in getWorkspaces:", error);
    return {
      success: false,
      error: "An error occurred while fetching workspaces.",
    };
  }
}

export async function getWorkspace(
  workspaceId: string
): Promise<ServerActionResponse<Workspace>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const workspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.id, workspaceId))
      .limit(1);

    if (workspace.length === 0) {
      return { success: false, error: "No workspace found with the given ID." };
    }

    return { success: true, data: workspace[0] as Workspace };
  } catch (error) {
    console.error("Error in getWorkspace:", error);
    return {
      success: false,
      error: "An error occurred while fetching the workspace.",
    };
  }
}

export async function deleteWorkspace(
  workspaceId: string
): Promise<ServerActionResponse<void>> {
  try {
    const userResult = await getUser();

    const userIdResult = userResult.id;

    if (!userIdResult) {
      return { success: false, error: "User not authenticated" };
    }

    await db
      .delete(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userIdResult))
      );

    const { sessionClaims, userId } = auth();
    if (sessionClaims?.activeWorkspaceId === workspaceId) {
      await clerkClient().users.updateUserMetadata(userId!, {
        publicMetadata: {
          activeWorkspaceId: null,
        },
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteWorkspace:", error);
    return {
      success: false,
      error: "An error occurred while deleting the workspace.",
    };
  }
}

export async function updateWorkspace(
  workspaceId: string,
  name: string
): Promise<ServerActionResponse<Workspace>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const updatedWorkspace = await db
      .update(workspaces)
      .set({ name })
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
      .returning();

    if (updatedWorkspace.length === 0) {
      return { success: false, error: "No workspace found with the given ID." };
    }

    return { success: true, data: updatedWorkspace[0] as Workspace };
  } catch (error) {
    console.error("Error in updateWorkspace:", error);
    return {
      success: false,
      error: "An error occurred while updating the workspace.",
    };
  }
}

export async function switchWorkspace(workspaceId: string) {
  const { userId } = auth();
  const user = await getUser();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const monthlyGrowPlan =
    env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "price_1QLXONRrqqSKPUNW7s5FxANR" // Pro plan dev price
      : "price_1QN9JoRrqqSKPUNWuTZBJWS1"; // Pro plan prod price

  const annualGrowPlan =
    env.NEXT_PUBLIC_NODE_ENV === "development"
      ? "price_1QMOYXRrqqSKPUNWcFVWJIs4" // Grow plan dev price
      : "price_1QN9NyRrqqSKPUNWWwB1zAXa"; // Grow plan prod price

  if (
    !user.priceId ||
    !user.stripeSubscriptionId ||
    (user.priceId !== monthlyGrowPlan && user.priceId !== annualGrowPlan)
  ) {
    return {
      success: false,
      error: "Upgrade to Grow Plan to switch workspaces.",
    };
  }

  await clerkClient().users.updateUserMetadata(userId, {
    publicMetadata: {
      activeWorkspaceId: workspaceId,
    },
  });
  return { success: true, data: undefined };
}

export async function getActiveWorkspaceId() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  const user = await clerkClient().users.getUser(userId);
  return user.publicMetadata.activeWorkspaceId as string | null;
}
