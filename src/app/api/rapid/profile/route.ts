import { NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { creators } from "@/server/db/schema";
import { RouteHandlerResponse } from "@/types";

export async function POST(
  req: Request
): Promise<NextResponse<RouteHandlerResponse<{ id: string }>>> {
  try {
    const { url } = (await req.json()) as any;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "URL parameter is missing" },
        { status: 400 }
      );
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

    return NextResponse.json({ success: true, data: { id: data.profile_id } });
  } catch (error) {
    console.error("Error in POST /api/rapid/profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
