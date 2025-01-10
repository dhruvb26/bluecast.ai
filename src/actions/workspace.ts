"use server";

import { and, count, eq } from "drizzle-orm";
import { db } from "@/server/db";
import { getUser, migrateToDefaultWorkspace } from "./user";
import { users, workspaceMembers, workspaces } from "@/server/db/schema";
import { ServerActionResponse } from "@/types";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { env } from "@/env";
import { v4 as uuidv4 } from "uuid";

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

    if (existingWorkspaces.length === 0) {
      await migrateToDefaultWorkspace();
    }

    if (existingWorkspaces.length >= 3) {
      return {
        success: false,
        error: "You have reached the maximum number of workspaces.",
      };
    }

    const response = await clerkClient().organizations.createOrganization({
      name,
      createdBy: userId,
    });

    const workspace = await db
      .insert(workspaces)
      .values({
        id: response.id,
        name: response.name,
        userId: response.createdBy,
      })
      .returning();

    await db.insert(workspaceMembers).values({
      id: uuidv4(),
      workspaceId: response.id,
      userId: response.createdBy,
      role: "org:admin",
    });

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

    const userPermissions = await checkUserPermissionsInWorkspace(workspaceId);
    if (userPermissions.data !== "org:admin") {
      return {
        success: false,
        error: "You are not an admin of this workspace.",
      };
    }

    await clerkClient().organizations.deleteOrganization(workspaceId || "");

    await db
      .delete(workspaces)
      .where(
        and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userIdResult))
      );

    // Find any remaining workspace for the user
    const remainingWorkspace = await db
      .select()
      .from(workspaces)
      .where(eq(workspaces.userId, userIdResult))
      .limit(1);

    await switchWorkspace(remainingWorkspace[0].id);

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
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const userPermissions = await checkUserPermissionsInWorkspace(workspaceId);
    if (userPermissions.data !== "org:admin") {
      return {
        success: false,
        error: "You are not an admin of this workspace.",
      };
    }

    await clerkClient().organizations.updateOrganization(workspaceId, {
      name,
    });

    const updatedWorkspace = await db
      .update(workspaces)
      .set({ name })
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
      .returning();

    if (updatedWorkspace.length === 0) {
      return { success: false, error: "No workspace found with the given ID." };
    }

    return { success: true, data: undefined };
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

  if (!userId) {
    throw new Error("User not authenticated");
  }

  // const monthlyGrowPlan =
  //   env.NEXT_PUBLIC_NODE_ENV === "development"
  //     ? "price_1QLXONRrqqSKPUNW7s5FxANR" // Pro plan dev price
  //     : "price_1QN9JoRrqqSKPUNWuTZBJWS1"; // Pro plan prod price

  // const annualGrowPlan =
  //   env.NEXT_PUBLIC_NODE_ENV === "development"
  //     ? "price_1QMOYXRrqqSKPUNWcFVWJIs4" // Grow plan dev price
  //     : "price_1QN9NyRrqqSKPUNWWwB1zAXa"; // Grow plan prod price

  // if (
  //   !user.priceId ||
  //   !user.stripeSubscriptionId ||
  //   (user.priceId !== monthlyGrowPlan && user.priceId !== annualGrowPlan)
  // ) {
  //   return {
  //     success: false,
  //     error: "Upgrade to Grow Plan to switch workspaces.",
  //   };
  // }

  if (workspaceId === "") {
    console.log("switching to personal");
    const getUserAccess = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    await clerkClient().users.updateUserMetadata(userId, {
      publicMetadata: {
        hasAccess: getUserAccess?.hasAccess,
        activeWorkspaceId: null,
      },
    });
    return { success: true, data: undefined };
  } else {
    console.log("switching to workspace", workspaceId);
    const workspaceAccess = await db.query.workspaces.findFirst({
      where: and(eq(workspaces.id, workspaceId)),
    });

    await clerkClient().users.updateUserMetadata(userId, {
      publicMetadata: {
        hasAccess: workspaceAccess?.hasAccess,
        activeWorkspaceId: workspaceId,
      },
    });
    return { success: true, data: undefined };
  }
}

export async function getActiveWorkspaceId() {
  const { userId } = auth();
  if (!userId) {
    return null;
  }

  const user = await clerkClient().users.getUser(userId);
  return user.publicMetadata.activeWorkspaceId as string | null;
}

export async function updateWorkspaceLinkedInName(
  workspaceId: string,
  linkedInName: string
): Promise<ServerActionResponse<Workspace>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return { success: false, error: "User not authenticated" };
    }

    const { sessionClaims } = auth();
    const activeWorkspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    // Only check ownership if there's an active workspace
    if (activeWorkspaceId) {
      if (activeWorkspaceId !== workspaceId) {
        return {
          success: false,
          error: "You are not an admin of this workspace.",
        };
      }

      const ownership = await db.query.workspaceMembers.findMany({
        where: and(
          eq(workspaceMembers.userId, userId),
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.role, "org:admin")
        ),
      });

      if (ownership.length === 0) {
        return {
          success: false,
          error: "You are not an admin of this workspace.",
        };
      }
    }

    const updatedWorkspace = await db
      .update(workspaces)
      .set({ linkedInName })
      .where(and(eq(workspaces.id, workspaceId), eq(workspaces.userId, userId)))
      .returning();

    if (updatedWorkspace.length === 0) {
      return { success: false, error: "No workspace found with the given ID." };
    }

    return { success: true, data: updatedWorkspace[0] as Workspace };
  } catch (error) {
    console.error("Error in updateWorkspaceLinkedInName:", error);
    return {
      success: false,
      error: "An error occurred while updating the workspace LinkedIn name.",
    };
  }
}

export async function inviteUserToWorkspace(
  workspaceId: string,
  email: string,
  role: string = "org:member"
) {
  const user = await getUser();
  if (!user.id) {
    return { success: false, error: "User not authenticated" };
  }

  // Verify the organization exists first
  const organization = await clerkClient().organizations.getOrganization({
    organizationId: workspaceId,
  });

  if (!organization) {
    return { success: false, error: "Workspace not found" };
  }

  const userPermissions = await checkUserPermissionsInWorkspace(workspaceId);
  if (userPermissions.data !== "org:admin") {
    return { success: false, error: "You are not an admin of this workspace." };
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email));
  let redirectUrl = "";

  redirectUrl = `${env.NEXT_PUBLIC_BASE_URL}/sign-in?invited=true`;

  const response =
    await clerkClient().organizations.createOrganizationInvitation({
      organizationId: workspaceId,
      emailAddress: email,
      role: role,
      inviterUserId: user.id,
      publicMetadata: {
        isInvited: true,
        invitedToWorkspace: workspaceId,
        inviterUserId: user.id,
      },
      redirectUrl,
    });

  return { success: true, data: undefined };
}

export async function getOrganizationInvitations(organizationId: string) {
  const invitations =
    await clerkClient().organizations.getOrganizationInvitationList({
      organizationId,
      status: ["pending"],
    });

  // Serialize the invitations data
  return invitations.data.map((invitation) => ({
    id: invitation.id,
    emailAddress: invitation.emailAddress,
    status: invitation.status,
    createdAt: invitation.createdAt,
  }));
}

export async function revokeInvitation(
  organizationId: string,
  invitationId: string
) {
  const user = await getUser();
  if (!user.id) {
    return { success: false, error: "User not authenticated" };
  }

  const userPermissions = await checkUserPermissionsInWorkspace(organizationId);
  if (userPermissions.data !== "org:admin") {
    return { success: false, error: "You are not an admin of this workspace." };
  }

  const response =
    await clerkClient().organizations.revokeOrganizationInvitation({
      organizationId,
      invitationId,
      requestingUserId: user.id,
    });

  if (response.status === "revoked") {
    return { success: true, data: undefined };
  }

  console.log(response);

  return { success: false, error: "Failed to revoke invitation" };
}

export async function deleteMemberFromWorkspace(
  workspaceId: string,
  userId: string
) {
  try {
    const userPermissions = await checkUserPermissionsInWorkspace(workspaceId);

    if (userPermissions.data !== "org:admin") {
      return {
        success: false,
        error: "You are not an admin of this workspace.",
      };
    }

    await clerkClient().organizations.deleteOrganizationMembership({
      organizationId: workspaceId,
      userId,
    });

    await db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.userId, userId)
        )
      );

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (
      user?.priceId === null &&
      user?.stripeSubscriptionId === null &&
      user?.stripeCustomerId === null
    ) {
      await db
        .update(users)
        .set({
          hasAccess: false,
          priceId: null,
          stripeSubscriptionId: null,
          stripeCustomerId: null,
          metadata: null,
          specialAccess: false,
          trialEndsAt: null,
        })
        .where(eq(users.id, userId));

      await clerkClient().users.updateUserMetadata(userId, {
        publicMetadata: {
          activeWorkspaceId: null,
          hasAccess: false,
        },
      });
    } else {
      await clerkClient().users.updateUserMetadata(userId, {
        publicMetadata: {
          activeWorkspaceId: null,
        },
      });
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in deleteMemberFromWorkspace:", error);
    return {
      success: false,
      error: "An error occurred while deleting the member.",
    };
  }
}

export async function getOrganizationMembers(organizationId: string) {
  const members =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId,
    });

  return members.data.map((member) => ({
    id: member.publicUserData?.userId,
    emailAddress: member.publicUserData?.identifier,
    role: member.role,
  }));
}

export async function updateUserMemberRole(
  workspaceId: string,
  userId: string,
  role: string
) {
  try {
    const userPermissions = await checkUserPermissionsInWorkspace(workspaceId);

    if (userPermissions.data !== "org:admin") {
      return {
        success: false,
        error: "You are not an admin of this workspace.",
      };
    }

    await clerkClient().organizations.updateOrganizationMembership({
      organizationId: workspaceId,
      userId,
      role,
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error("Error in updateUserMemberRole:", error);
    return {
      success: false,
      error: "An error occurred while updating the member role.",
    };
  }
}

export async function checkUserPermissionsInWorkspace(workspaceId: string) {
  const user = await getUser();
  if (!user.id) {
    return { success: false, error: "User not authenticated" };
  }

  const { data } =
    await clerkClient().organizations.getOrganizationMembershipList({
      organizationId: workspaceId,
    });

  // Find the membership for the current user
  const userMembership = data.find(
    (member) => member.publicUserData?.userId === user.id
  );

  if (!userMembership) {
    return { success: false, error: "User is not a member of this workspace" };
  }

  return { success: true, data: userMembership.role };
}

export async function getWorkspaceMemberships() {
  const user = await currentUser();

  const memberships = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.userId, user?.id || ""));

  return memberships.length;
}

export async function getUserAccessInWorkspace() {
  const user = await currentUser();

  const { sessionClaims } = auth();

  const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
    | string
    | undefined;

  if (!workspaceId) {
    return { success: true, data: "personal" };
  }

  const role = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.userId, user?.id || ""),
        eq(workspaceMembers.workspaceId, workspaceId)
      )
    )
    .limit(1);

  return { success: true, data: role[0]?.role };
}

export async function getNumberOfOwnerWorkspaces() {
  const user = await getUser();
  const userId = user.id;

  const result = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.userId, userId));

  return result.length;
}
