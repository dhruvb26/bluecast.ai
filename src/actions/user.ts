"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts, users } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
export async function getLinkedInId() {
  try {
    const user = await currentUser();

    if (!user) {
      throw new Error("No user found.");
    }

    const linkedInAccount = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, user.id))
      .limit(1);

    if (!linkedInAccount) {
      throw new Error("No LinkedIn account found for the user.");
    }

    return linkedInAccount;
  } catch (error) {
    console.error("Error in getLinkedInId:", error);
    throw error;
  }
}

export async function getUser() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: {
        id: true,
        name: true,
        email: true,
        image: true,
        headline: true,
        trialEndsAt: true,
        specialAccess: true,
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
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
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
    console.log("Called checking access: returning access");
    if (user[0].specialAccess) return true;

    return user[0].hasAccess;
  } catch (error) {
    console.error("Error in checkAccess:", error);
    throw error;
  }
}

export async function checkValidity() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
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

export async function setGeneratedWords(words: number) {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
    await db
      .update(users)
      .set({
        generatedWords: sql`${users.generatedWords} + ${words}`,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Error in setGeneratedWords:", error);
    throw error;
  }
}

export async function getGeneratedWords() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
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

export async function completeOnboarding(onboardingData: any) {
  try {
    const { userId } = auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    if (!onboardingData) {
      throw new Error("Invalid onboarding data");
    }

    // Update user's information in the database
    await db
      .update(users)
      .set({
        onboardingData: onboardingData,
        onboardingComplete: true,
      })
      .where(eq(users.id, userId));

    // Update Clerk user metadata
    await clerkClient().users.updateUserMetadata(userId, {
      publicMetadata: {
        onboardingComplete: true,
      },
    });

    return { message: "Onboarding completed successfully" };
  } catch (error) {
    console.error("Error during onboarding:", error);
    throw error;
  }
}
