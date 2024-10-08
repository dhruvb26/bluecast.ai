import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { creatorListItems, creators } from "@/server/db/schema";
import { sql } from "drizzle-orm";
import { env } from "@/env";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const creatorUrls = await db
      .select({
        id: creators.id,
        profileUrl: creators.profileUrl,
      })
      .from(creatorListItems)
      .innerJoin(creators, sql`${creatorListItems.creatorId} = ${creators.id}`)
      .groupBy(creators.id, creators.profileUrl);

    // Send requests for each unique creator
    for (const creator of creatorUrls) {
      await fetch(`${env.BASE_URL}/api/rapid/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: creator.profileUrl,
        }),
      });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating inspiration:", error);
    return NextResponse.json(
      { error: "Error updating inspiration" },
      { status: 500 }
    );
  }
}
