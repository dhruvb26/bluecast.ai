"use server";

import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { asc, eq, desc } from "drizzle-orm";

import { parseRelativeTime } from "@/utils/date";
export type Post = {
  id: string;
  creatorId: string;
  images?: string[];
  document?: Record<string, any>;
  video?: Record<string, any>;
  numAppreciations?: number;
  numComments?: number;
  numEmpathy?: number;
  numInterests?: number;
  numLikes?: number;
  numReposts?: number;
  postUrl?: string;
  reshared?: boolean;
  text?: string;
  time?: string;
  urn?: string;
};

export async function createPost(postData: {
  id: string;
  creatorId: string;
  images?: string[];
  document?: Record<string, any>;
  video?: Record<string, any>;
  numAppreciations?: number;
  numComments?: number;
  numEmpathy?: number;
  numInterests?: number;
  numLikes?: number;
  numReposts?: number;
  postUrl?: string;
  reshared?: boolean;
  text?: string;
  time?: string;
  urn?: string;
}) {
  try {
    const [newPost] = await db
      .insert(posts)
      .values({
        ...postData,
        images: postData.images ? postData.images : undefined,
        document: postData.document ? postData.document : undefined,
        video: postData.video ? postData.video : undefined,
      })
      .returning();
    return { success: true, post: newPost };
  } catch (error) {
    console.error("Error creating post:", error);
    return { success: false, error: "Failed to create post" };
  }
}

export async function getPostById(id: string) {
  try {
    const post = await db.query.posts.findFirst({
      where: eq(posts.id, id),
      with: {
        creator: true,
      },
    });
    return post;
  } catch (error) {
    console.error("Error fetching post:", error);
    return null;
  }
}

export async function updatePost(
  id: string,
  updateData: Partial<typeof posts.$inferInsert>
) {
  try {
    const [updatedPost] = await db
      .update(posts)
      .set(updateData)
      .where(eq(posts.id, id))
      .returning();
    return { success: true, post: updatedPost };
  } catch (error) {
    console.error("Error updating post:", error);
    return { success: false, error: "Failed to update post" };
  }
}

export async function deletePost(id: string) {
  try {
    await db.delete(posts).where(eq(posts.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting post:", error);
    return { success: false, error: "Failed to delete post" };
  }
}

export async function getPostsByCreatorId(
  creatorId: string,
  limit: number = 20,
  page: number = 1
) {
  try {
    const offset = (page - 1) * limit;
    const creatorPosts = await db.query.posts.findMany({
      where: eq(posts.creatorId, creatorId),
      orderBy: [desc(posts.time)],
      with: {
        creator: true,
      },
      limit: limit,
      offset: offset,
    });

    // Sort posts based on relative time
    const sortedPosts = creatorPosts.sort((a, b) => {
      const timeA = parseRelativeTime(a.time || "");
      const timeB = parseRelativeTime(b.time || "");
      return timeB.getTime() - timeA.getTime();
    });

    return { success: true, posts: sortedPosts };
  } catch (error) {
    console.error("Error fetching posts by creator:", error);
    return { success: false, error: "Failed to fetch posts by creator" };
  }
}

export async function getAllPosts() {
  try {
    const allPosts = await db.query.posts.findMany({
      with: {
        creator: true,
      },
      orderBy: [asc(posts.createdAt)],
    });
    return { success: true, posts: allPosts };
  } catch (error) {
    console.error("Error fetching all posts:", error);
    return { success: false, error: "Failed to fetch all posts" };
  }
}
