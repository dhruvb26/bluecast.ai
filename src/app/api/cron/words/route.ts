import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { and, isNotNull } from "drizzle-orm";
import { env } from "@/env";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    // Update users with subscriptions in the database
    const result = await db
      .update(users)
      .set({ generatedWords: 0 })
      .where(
        and(
          isNotNull(users.stripeSubscriptionId),
          isNotNull(users.stripeCustomerId),
          isNotNull(users.priceId)
        )
      );

    return NextResponse.json({ updated: result.count }, { status: 200 });
  } catch (error) {
    console.error("Error resetting generated words:", error);
    return NextResponse.json(
      { error: "Error resetting generated words" },
      { status: 500 }
    );
  }
}
