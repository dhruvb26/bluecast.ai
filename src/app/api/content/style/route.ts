import { NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { creators, contentStyles, posts } from "@/server/db/schema";
import { RouteHandlerResponse } from "@/types";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "@/actions/user";

export async function POST(
  req: Request
): Promise<NextResponse<RouteHandlerResponse<{ data: any }>>> {
  try {
    const user = await getUser();
    const userId = user.id;
    const { url } = (await req.json()) as { url: string };

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL parameter is missing" },
        { status: 400 }
      );
    }

    const existingCreator = await db.query.creators.findFirst({
      where: eq(creators.profileUrl, url),
    });

    if (existingCreator) {
      const creatorPosts = await db.query.posts.findMany({
        where: eq(posts.creatorId, existingCreator.id),
        limit: 10,
      });
      const examples = creatorPosts
        .map((post) => post.text)
        .filter((text): text is string => Boolean(text));

      const newContentStyle = await db.insert(contentStyles).values({
        id: uuidv4(),
        creatorId: existingCreator.id,
        userId,
        name: existingCreator.fullName ?? "",
        examples,
      });

      return NextResponse.json({
        success: true,
        data: { data: newContentStyle },
      });
    }

    const response = await fetch(
      `https://${
        env.RAPIDAPI_HOST
      }/get-linkedin-profile?linkedin_url=${encodeURIComponent(url)}`,
      {
        method: "GET",
        headers: {
          "x-rapidapi-key": env.RAPIDAPI_KEY,
          "x-rapidapi-host": env.RAPIDAPI_HOST,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData: any = await response.json();
    const data = responseData.data;

    await db
      .insert(creators)
      .values({
        id: data.profile_id,
        profileUrl: data.linkedin_url,
        fullName: data.full_name,
        profileImageUrl: data.profile_image_url,
        headline: data.headline,
        urn: data.urn,
      })
      .onConflictDoUpdate({
        target: creators.id,
        set: {
          profileUrl: data.linkedin_url,
          fullName: data.full_name,
          profileImageUrl: data.profile_image_url,
          headline: data.headline,
          urn: data.urn,
        },
      });

    const postsResponse = await fetch(`${env.BASE_URL}/api/rapid/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creatorId: data.profile_id,
        url: data.linkedin_url,
      }),
    });

    if (!postsResponse.ok) {
      console.error("Error updating posts table:", await postsResponse.text());
    }

    // Fetch posts for the creator
    const creatorPosts = await db.query.posts.findMany({
      where: eq(posts.creatorId, data.profile_id),
      limit: 10,
    });

    // Extract text from posts for examples
    const examples = creatorPosts
      .map((post) => post.text)
      .filter((text): text is string => Boolean(text));

    // Save content style
    const newContentStyle = await db.insert(contentStyles).values({
      id: uuidv4(),
      creatorId: data.profile_id,
      userId,
      name: data.full_name,
      examples,
    });

    return NextResponse.json({
      success: true,
      data: { data: newContentStyle },
    });
  } catch (error) {
    console.error("Error in POST /api/content/style:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
