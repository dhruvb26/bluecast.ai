"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts, forYouAnswers, users, workspaces } from "@/server/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { generatedPosts } from "@/server/db/schema";
import { v4 as uuidv4 } from "uuid";
import { LinkedInPost } from "@/app/api/ai/for-you/route";
import { usePostStore } from "@/store/post";

export type User = {
  id: string;
  name: string | null;
  email: string;
  emailVerified: Date | null;
  linkedInId: string | null;
  image: string | null;
  hasAccess: boolean | null;
  priceId: string | null;
  stripeCustomerId: string | null;
  headline: string | null;
  stripeSubscriptionId: string | null;
  trialEndsAt: Date | null;
  onboardingComplete: boolean | null;
  forYouGeneratedPosts: number;
  generatedWords: number;
  generatedPosts: number;
  onboardingData: any;
  specialAccess: boolean | null;
};

export async function getLinkedInId() {
  try {
    const user = await currentUser();
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!user) {
      throw new Error("No user found.");
    }

    const conditions = [eq(accounts.userId, user.id)];

    if (workspaceId) {
      conditions.push(eq(accounts.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(accounts.workspaceId));
    }

    const linkedInAccount = await db
      .select()
      .from(accounts)
      .where(and(...conditions))
      .limit(1);

    // Return null if no account is found instead of throwing an error
    return linkedInAccount.length > 0 ? linkedInAccount : null;
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

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
      if (workspaceId) {
        // Check workspace usage limit
        const workspace = await db
          .select({ usage: workspaces.usage })
          .from(workspaces)
          .where(eq(workspaces.id, workspaceId))
          .limit(1);

        return workspace[0]?.usage < 75000;
      } else {
        // Check personal usage limit based on whether user has any workspaces
        const userWorkspaces = await db
          .select()
          .from(workspaces)
          .where(eq(workspaces.userId, userId));

        const wordLimit = userWorkspaces.length > 0 ? 75000 : 50000;
        return user[0].generatedWords < wordLimit;
      }
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
    const userClerk = await currentUser();
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;
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

    if (user[0].hasAccess) {
      if (user[0].specialAccess) {
        await db
          .update(users)
          .set({
            generatedPosts: sql`${users.generatedPosts} + 1`,
          })
          .where(eq(users.id, userId));

        usePostStore.getState().setWordsGenerated(1);
      } else {
        // Handle workspace-specific or personal usage
        if (workspaceId) {
          await db
            .update(workspaces)
            .set({
              usage: sql`${workspaces.usage} + ${words}`,
            })
            .where(eq(workspaces.id, workspaceId));
        } else {
          await db
            .update(users)
            .set({
              generatedWords: sql`${users.generatedWords} + ${words}`,
            })
            .where(eq(users.id, userId));
        }

        usePostStore.getState().setWordsGenerated(words);
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
  console.log("Starting updateUserImage for userId:", userId);
  console.log("File URL:", fileUrl);

  if (!userId) {
    console.error("No userId provided");
    throw new Error("Unauthorized");
  }

  try {
    // Get current workspace ID from session claims
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;
    console.log("Current workspace ID:", workspaceId);

    // Fetch the image from the fileUrl
    console.log("Fetching image from URL");
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    console.log("Image blob size:", blob.size);

    // Create a File object from the blob
    const file = new File([blob], "profile-picture.png", { type: "image/png" });
    console.log("Created File object");

    if (!workspaceId) {
      console.log("Updating personal user profile");
      await db
        .update(users)
        .set({ image: fileUrl })
        .where(eq(users.id, userId));
      console.log("Personal profile update complete");
    } else {
      console.log("Updating workspace profile");
      await db
        .update(workspaces)
        .set({ linkedInImageUrl: fileUrl })
        .where(eq(workspaces.id, workspaceId));
      console.log("Workspace profile update complete");
    }

    console.log("Profile image update successful");
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    // Check if the user already has a for_you_answer entry
    const conditions = [eq(forYouAnswers.userId, userId)];

    if (workspaceId) {
      conditions.push(eq(forYouAnswers.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(forYouAnswers.workspaceId));
    }

    const existingAnswer = await db.query.forYouAnswers.findFirst({
      where: and(...conditions),
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
        .where(and(...conditions));
    } else {
      // Create new entry
      await db.insert(forYouAnswers).values({
        id: crypto.randomUUID(),
        userId,
        workspaceId,
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    const conditions = [eq(forYouAnswers.userId, userId)];

    if (workspaceId) {
      conditions.push(eq(forYouAnswers.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(forYouAnswers.workspaceId));
    }

    const answers = await db.query.forYouAnswers.findFirst({
      where: and(...conditions),
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    const conditions = [eq(generatedPosts.userId, userId)];

    if (workspaceId) {
      conditions.push(eq(generatedPosts.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(generatedPosts.workspaceId));
    }

    const posts = await db.query.generatedPosts.findMany({
      where: and(...conditions),
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
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!userClerk) {
      throw new Error("No user found.");
    }

    const userId = userClerk.id;

    const conditions = [eq(generatedPosts.userId, userId)];

    if (workspaceId) {
      conditions.push(eq(generatedPosts.workspaceId, workspaceId));
    } else {
      conditions.push(isNull(generatedPosts.workspaceId));
    }

    // Delete existing posts for the user
    await db.delete(generatedPosts).where(and(...conditions));

    // Insert new posts (up to 6)
    const newPosts = posts.slice(0, 6).map((post) => ({
      id: uuidv4(),
      userId,
      workspaceId,
      content: post.content,
    }));

    await db.insert(generatedPosts).values(newPosts);

    return { message: "For You posts saved successfully" };
  } catch (error) {
    console.error("Error saving For You posts:", error);
    throw error;
  }
}

export async function getActiveWorkspace() {
  try {
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    if (!workspaceId) {
      return null;
    }

    const workspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
      columns: {
        name: true,
        id: true,
        linkedInName: true,
        linkedInHeadline: true,
        linkedInImageUrl: true,
      },
    });

    return workspace;
  } catch (error) {
    console.error("Error fetching active workspace:", error);
    throw error;
  }
}

// export async function migrateToDefaultWorkspace(userId?: string) {
//   try {
//     console.log("Migrating to default workspace");
//     if (!userId) {
//       const userClerk = await currentUser();
//       if (!userClerk) {
//         throw new Error("No user found.");
//       }
//       userId = userClerk.id;
//     }

//     // 1. Create default workspace
//     const orgResponse = await clerkClient().organizations.createOrganization({
//       name: "DEFAULT",
//       createdBy: userId,
//     });

//     const workspace = await db
//       .insert(workspaces)
//       .values({
//         id: orgResponse.id,
//         name: orgResponse.name,
//         userId: orgResponse.createdBy,
//       })
//       .returning();

//     // 2. Create workspace membership
//     await db.insert(workspaceMembers).values({
//       id: uuidv4(),
//       workspaceId: workspace[0].id,
//       userId: userId,
//       role: "org:admin",
//     });

//     // 3. Update all relevant tables
//     const tables = [
//       { table: ideas, column: ideas.workspaceId },
//       { table: drafts, column: drafts.workspaceId },
//       { table: accounts, column: accounts.workspaceId },
//       { table: forYouAnswers, column: forYouAnswers.workspaceId },
//       { table: generatedPosts, column: generatedPosts.workspaceId },
//       { table: contentStyles, column: contentStyles.workspaceId },
//       { table: creatorLists, column: creatorLists.workspaceId },
//       { table: instructions, column: instructions.workspaceId },
//     ];

//     for (const { table, column } of tables) {
//       await db
//         .update(table)
//         .set({
//           workspaceId: workspace[0].id,
//         })
//         .where(and(eq(table.userId, userId), isNull(column)));
//     }

//     return { success: true, workspaceId: workspace[0].id };
//   } catch (error) {
//     console.error("Error in migrateToDefaultWorkspace:", error);
//     throw error;
//   }
// }
