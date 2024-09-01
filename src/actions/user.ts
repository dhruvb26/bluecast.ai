"use server";

import { getServerAuthSession } from "@/server/auth";
import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  users,
  accounts,
  sessions,
  drafts,
  ideas,
  verificationTokens,
} from "@/server/db/schema";

export async function getAccessToken() {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      throw new Error("No session found for the user.");
    }

    const account = await db.query.accounts.findFirst({
      where: eq(accounts.userId, session.user.id),
      columns: {
        access_token: true,
        expires_at: true,
      },
    });

    if (!account) {
      throw new Error("No LinkedIn account found for the user.");
    }

    return account.access_token;
  } catch (error) {
    console.error("Error in getAccessToken:", error);
    throw error;
  }
}

export async function getLinkedInId() {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      throw new Error("No session found for the user.");
    }

    const account = await db
      .select({ providerAccountId: accounts.providerAccountId })
      .from(accounts)
      .where(eq(accounts.userId, session.user.id))
      .limit(1);

    if (!account[0]) {
      throw new Error("No LinkedIn account found for the user.");
    }

    return account[0].providerAccountId;
  } catch (error) {
    console.error("Error in getLinkedInId:", error);
    throw error;
  }
}

export async function getUser() {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      throw new Error("No session found for the user.");
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        onboardingData: true,
      },
    });

    if (!user) {
      throw new Error("User not found in the database.");
    }

    return user;
  } catch (error) {
    console.error("Error in getUser:", error);
    throw error;
  }
}

export async function checkAccess() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    const userId = session.user.id;
    const user = await db
      .select({
        specialAccess: users.specialAccess,
        hasAccess: users.hasAccess,
        generatedWords: users.generatedWords,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found in the database.");
    }

    if (user[0].specialAccess) return true;

    return user[0].hasAccess && user[0].generatedWords < 10000;
  } catch (error) {
    console.error("Error in checkAccess:", error);
    throw error;
  }
}

export async function checkValidity() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    const userId = session.user.id;
    const user = await db
      .select({ trialEndsAt: users.trialEndsAt })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found in the database.");
    }

    return user[0].trialEndsAt;
  } catch (error) {
    console.error("Error in checkValidity:", error);
    throw error;
  }
}

export async function updateGeneratedWords(words: number) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    const userId = session.user.id;
    await db
      .update(users)
      .set({
        generatedWords: sql`${users.generatedWords} + ${words}`,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Error in updateGeneratedWords:", error);
    throw error;
  }
}

export async function getGeneratedWords() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    const userId = session.user.id;
    const result = await db
      .select({ generatedWords: users.generatedWords })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!result[0]) {
      throw new Error("User not found in the database.");
    }

    return result[0].generatedWords;
  } catch (error) {
    console.error("Error in getGeneratedWords:", error);
    throw error;
  }
}

export async function deleteUser() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    const userId = session.user.id;

    await db.transaction(async (tx) => {
      // Delete related records first
      await tx.delete(accounts).where(eq(accounts.userId, userId));
      await tx.delete(sessions).where(eq(sessions.userId, userId));
      await tx.delete(drafts).where(eq(drafts.userId, userId));
      await tx.delete(ideas).where(eq(ideas.userId, userId));
      await tx
        .delete(verificationTokens)
        .where(eq(verificationTokens.identifier, userId));

      // Delete the user last
      await tx.delete(users).where(eq(users.id, userId));
    });

    return { success: true };
  } catch (error) {
    console.error("Error in deleteUser:", error);
    throw error;
  }
}

export async function setUserOnboarding(completed: boolean) {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    await db
      .update(users)
      .set({ onboardingCompleted: completed })
      .where(eq(users.id, session.user.id));
    return { success: true };
  } catch (error) {
    console.error("Error in setUserOnboarding:", error);
    throw error;
  }
}

export async function setUserOnboardingData(formData: {
  role: string;
  heardFrom: string;
  topics: string[];
}) {
  const session = await getServerAuthSession();
  if (!session) throw new Error("Unauthorized");

  const userId = session.user.id;
  const onboardingData = {
    ...formData,
    completedAt: new Date(),
  };

  try {
    const result = await db
      .update(users)
      .set({
        onboardingData: sql`${JSON.stringify(onboardingData)}::jsonb`,
        onboardingCompleted: true,
      })
      .where(eq(users.id, userId))
      .returning({ updatedId: users.id });

    if (result.length === 0) throw new Error("User not found or update failed");
    return { success: true };
  } catch (error) {
    console.error("Error completing onboarding:", error);
    throw new Error("Failed to complete onboarding");
  }
}

export async function getUserOnboardingData() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      throw new Error("No session found for the user.");
    }

    const userId = session.user.id;
    const result = await db
      .select({
        onboardingData: users.onboardingData,
        onboardingCompleted: users.onboardingCompleted,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (result.length === 0) {
      throw new Error("User not found in the database");
    }

    return {
      success: true,
      data: {
        onboardingData: result[0].onboardingData,
        onboardingCompleted: result[0].onboardingCompleted,
      },
    };
  } catch (error) {
    console.error("Error in getUserOnboardingData:", error);
    throw error;
  }
}
