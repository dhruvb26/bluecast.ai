"use server";

import { eq, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts, forYouAnswers, users } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { generatedPosts } from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { LinkedInPost } from "@/app/api/ai/for-you/route";
import { usePostStore } from "@/store/post";

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
        generatedPosts: users.generatedPosts,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      throw new Error("User not found in the database.");
    }

    if (user[0].specialAccess) {
      return user[0].generatedPosts < 10;
    } else if (user[0].hasAccess) {
      return user[0].generatedWords < 50000;
    }

    return false;
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
    console.log("Starting setGeneratedWords function");
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
    console.log(`User ID: ${userId}`);
    const user = await db
      .select({
        hasAccess: users.hasAccess,
        specialAccess: users.specialAccess,
        stripeSubscriptionId: users.stripeSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, userId));

    if (!user[0]) {
      throw new Error("User not found in the database.");
    }

    console.log(`User found: ${JSON.stringify(user[0])}`);

    if (user[0].hasAccess) {
      if (user[0].specialAccess) {
        console.log("User has special access. Incrementing generated posts.");
        await db
          .update(users)
          .set({
            generatedPosts: sql`${users.generatedPosts} + 1`,
          })
          .where(eq(users.id, userId));

        usePostStore.getState().setWordsGenerated(1); // Update the store
        console.log("Generated posts incremented by 1.");
      } else {
        console.log(
          `User does not have special access. Incrementing generated words by ${words}.`
        );
        await db
          .update(users)
          .set({
            generatedWords: sql`${users.generatedWords} + ${words}`,
          })
          .where(eq(users.id, userId));

        usePostStore.getState().setWordsGenerated(words); // Update the store
        console.log(`Generated words incremented by ${words}.`);
      }
    }
  } catch (error) {
    console.error("Error in setGeneratedWords:", error);
    throw error;
  }
}

export async function updateGeneratedPosts() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
    await db
      .update(users)
      .set({
        generatedPosts: sql`${users.generatedPosts} + 1`,
      })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("Error in setGeneratedWords:", error);
    throw error;
  }
}

export async function getGeneratedPosts() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
    const result = await db
      .select({ generatedPosts: users.generatedPosts })
      .from(users)
      .where(eq(users.id, userId));

    if (!result[0]) {
      throw new Error("User not found in the database.");
    }

    return result[0].generatedPosts;
  } catch (error) {
    console.error("Error in getGeneratedWords:", error);
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
        hasAccess: true,
        onboardingComplete: true,
      },
    });

    return { message: "Onboarding completed successfully" };
  } catch (error) {
    console.error("Error during onboarding:", error);
    throw error;
  }
}

export async function updateUserImage(userId: string, fileUrl: string) {
  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    // Fetch the image from the fileUrl
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    // Create a File object from the blob
    const file = new File([blob], "profile-picture.png", { type: "image/png" });

    // Update Clerk user profile image
    await clerkClient.users.updateUserProfileImage(userId, { file });

    // Update the image URL in your database
    await db.update(users).set({ image: fileUrl }).where(eq(users.id, userId));

    return { message: "Profile image updated successfully" };
  } catch (error) {
    console.error("Error updating user image:", error);
    throw error;
  }
}

export async function saveForYouAnswers(
  aboutYourself: string,
  targetAudience: string,
  personalTouch: string,
  contentStyle?: string,
  topics?: string[],
  formats?: string[]
) {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    // Check if the user already has a for_you_answer entry
    const existingAnswer = await db.query.forYouAnswers.findFirst({
      where: eq(forYouAnswers.userId, userId),
    });

    const topicsToSave = Array.isArray(topics) ? topics : [];
    const formatsToSave = Array.isArray(formats) ? formats : [];

    if (existingAnswer) {
      // Update existing entry
      await db
        .update(forYouAnswers)
        .set({
          aboutYourself,
          targetAudience,
          personalTouch,
          contentStyle,
          topics: topicsToSave,
          formats: formatsToSave,
          updatedAt: new Date(),
        })
        .where(eq(forYouAnswers.userId, userId));
    } else {
      // Create new entry
      await db.insert(forYouAnswers).values({
        id: crypto.randomUUID(),
        userId,
        aboutYourself,
        targetAudience,
        personalTouch,
        contentStyle,
        topics: topicsToSave,
        formats: formatsToSave,
      });
    }

    return { message: "For You answers saved successfully" };
  } catch (error) {
    console.error("Error saving For You answers:", error);
    throw error;
  }
}

export async function getForYouAnswers() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    const answers = await db.query.forYouAnswers.findFirst({
      where: eq(forYouAnswers.userId, userId),
    });

    if (!answers) {
      return null;
    }

    return {
      aboutYourself: answers.aboutYourself,
      targetAudience: answers.targetAudience,
      personalTouch: answers.personalTouch,
      contentStyle: answers.contentStyle,
      topics: answers.topics,
      formats: answers.formats,
    };
  } catch (error) {
    console.error("Error fetching For You answers:", error);
    throw error;
  }
}

export async function getForYouPosts() {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    const posts = await db.query.generatedPosts.findMany({
      where: eq(generatedPosts.userId, userId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            headline: true,
            image: true,
          },
        },
      },
    });

    return posts.map((post) => ({
      ...post,
      user: {
        id: post.user.id,
        name: post.user.name,
        headline: post.user.headline,
        image: post.user.image,
      },
    }));
  } catch (error) {
    console.error("Error fetching For You posts:", error);
    throw error;
  }
}

export async function saveForYouPosts(posts: LinkedInPost[]) {
  try {
    const userClerk = await currentUser();

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    // Delete existing posts for the user
    await db.delete(generatedPosts).where(eq(generatedPosts.userId, userId));

    // Insert new posts (up to 6)
    const newPosts = posts.slice(0, 6).map((post) => ({
      id: uuidv4(),
      userId,
      content: post.content,
    }));

    await db.insert(generatedPosts).values(newPosts);

    return { message: "For You posts saved successfully" };
  } catch (error) {
    console.error("Error saving For You posts:", error);
    throw error;
  }
}
