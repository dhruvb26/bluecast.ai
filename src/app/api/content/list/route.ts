import { NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { creators, creatorLists, creatorListItems } from "@/server/db/schema";
import { RouteHandlerResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { getUser } from "@/actions/user";
import { eq, isNull } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export async function POST(
  req: Request
): Promise<NextResponse<RouteHandlerResponse<{ data: any }>>> {
  try {
    const user = await getUser();
    const { url, listName } = (await req.json()) as any;
    const { sessionClaims } = auth();
    const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
      | string
      | undefined;

    const isPublic = false;

    if (!url || !listName) {
      return NextResponse.json(
        { success: false, error: "URL and list name are required" },
        { status: 400 }
      );
    }
    // 1. Find or create the creator_list
    let creatorList = await db.query.creatorLists.findFirst({
      where: (creatorLists, { eq, and }) =>
        and(
          eq(creatorLists.name, listName),
          isPublic
            ? isNull(creatorLists.userId)
            : eq(creatorLists.userId, user.id),
          workspaceId
            ? eq(creatorLists.workspaceId, workspaceId)
            : isNull(creatorLists.workspaceId)
        ),
    });

    let creatorListId;
    if (!creatorList) {
      creatorListId = uuidv4();
      await db.insert(creatorLists).values({
        id: creatorListId,
        name: listName,
        userId: isPublic ? null : user.id,
        workspaceId: isPublic ? null : workspaceId,
      });
    } else {
      creatorListId = creatorList.id;
    }

    // Fetch or create creator
    let creator = await db.query.creators.findFirst({
      where: (creators, { eq }) => eq(creators.profileUrl, url),
    });

    if (!creator) {
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

      creator = {
        id: data.profile_id,
        profileUrl: data.linkedin_url,
        fullName: data.full_name,
        profileImageUrl: data.profile_image_url,
        headline: data.headline,
        urn: data.urn,
      };

      await db.insert(creators).values(creator);
    }

    // 2. Add creator to the list if not already present
    const existingListItem = await db.query.creatorListItems.findFirst({
      where: (items, { eq, and }) =>
        and(
          eq(items.creatorListId, creatorListId),
          eq(items.creatorId, creator.id)
        ),
    });

    if (!existingListItem) {
      await db.insert(creatorListItems).values({
        id: uuidv4(),
        creatorListId,
        creatorId: creator.id,
      });
    }

    // 3. Fetch posts for the creator
    const postsResponse = await fetch(`${env.BASE_URL}/api/rapid/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        creatorId: creator.id,
        url: creator.profileUrl,
      }),
    });

    if (!postsResponse.ok) {
      console.error("Error fetching posts:", await postsResponse.text());
    }

    return NextResponse.json({
      success: true,
      data: { data: { creatorListId, creatorId: creator.id } },
    });
  } catch (error) {
    console.error("Error in POST /api/content/list:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
