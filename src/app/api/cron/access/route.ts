import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { env } from "@/env";
import { clerkClient } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const now = new Date();

    // Get all users whose trial has ended
    const usersToUpdate = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.hasAccess, true),
          lt(users.trialEndsAt, now),
          eq(users.specialAccess, false)
        )
      );

    // Update users in the database
    const result = await db
      .update(users)
      .set({ hasAccess: false, trialEndsAt: null })
      .where(
        and(
          eq(users.hasAccess, true),
          lt(users.trialEndsAt, now),
          eq(users.specialAccess, false)
        )
      );

    // Update Clerk metadata for each user
    for (const user of usersToUpdate) {
      await clerkClient.users.updateUserMetadata(user.id, {
        publicMetadata: {
          hasAccess: false,
        },
      });
    }

    return NextResponse.json({ updated: result.count }, { status: 200 });
  } catch (error) {
    console.error("Error updating trial access:", error);
    return NextResponse.json(
      { error: "Error updating trial access" },
      { status: 500 }
    );
  }
}
