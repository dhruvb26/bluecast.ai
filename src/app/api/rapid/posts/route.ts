import { NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { posts } from "@/server/db/schema";
import { RouteHandlerResponse } from "@/types";
import { sql } from "drizzle-orm";

export async function POST(
  req: Request
): Promise<NextResponse<RouteHandlerResponse<{ posts: any[] }>>> {
  try {
    const body = await req.json();
    const { url, creatorId } = body as { url: string; creatorId: string };

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL parameter is missing" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://${
        env.RAPIDAPI_HOST
      }/get-profile-posts?linkedin_url=${encodeURIComponent(url)}`,
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
    const postsData = responseData.data.map((post: any) => ({
      id: post.urn,
      images: post.images,
      document: post.document,
      video: post.video,
      numAppreciations: post.num_appreciations,
      numComments: post.num_comments,
      numEmpathy: post.num_empathy,
      numInterests: post.num_interests,
      numLikes: post.num_likes,
      numReposts: post.num_reposts,
      postUrl: post.post_url,
      reshared: post.reshared,
      text: post.text,
      time: post.time,
      urn: post.urn,
    }));

    for (const post of postsData) {
      await db
        .insert(posts)
        .values({
          ...post,
          creatorId: creatorId,
        })
        .onConflictDoUpdate({
          target: posts.id,
          set: {
            images: post.images,
            document: post.document,
            video: post.video,
            numAppreciations: post.numAppreciations,
            numComments: post.numComments,
            numEmpathy: post.numEmpathy,
            numInterests: post.numInterests,
            numLikes: post.numLikes,
            numReposts: post.numReposts,
            postUrl: post.postUrl,
            reshared: post.reshared,
            text: post.text,
            time: post.time,
            urn: post.urn,
            creatorId: creatorId,
          },
        });
    }

    return NextResponse.json({ success: true, data: { posts: postsData } });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { success: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}
