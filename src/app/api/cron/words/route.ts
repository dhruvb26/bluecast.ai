import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users, workspaces } from "@/server/db/schema";
import { and, eq, isNotNull } from "drizzle-orm";
import { env } from "@/env";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const usersWithSubscriptions = await db
      .select()
      .from(users)
      .where(
        and(isNotNull(users.stripeSubscriptionId), isNotNull(users.stripeCustomerId), isNotNull(users.priceId))
      );


      for (const user of usersWithSubscriptions) {
      await db.update(users).set({ generatedWords: 0, forYouGeneratedPosts: 0 }).where(eq(users.id, user.id));
      }

      let workspacesUpdated = 0;
      // Find if users have any workspaces
      for (const user of usersWithSubscriptions) {
        const workspacesResult = await db.select().from(workspaces).where(eq(workspaces.userId, user.id));
        if (workspacesResult.length > 0) {
          await db.update(workspaces).set({ usage: 0 }).where(eq(workspaces.userId, user.id));
          workspacesUpdated++;
        }
      }


    return NextResponse.json({ updated: usersWithSubscriptions.length, workspacesUpdated }, { status: 200 });
  } catch (error) {
    console.error("Error resetting generated words:", error);
    return NextResponse.json(
      { error: "Error resetting generated words" },
      { status: 500 }
    );
  }
}
