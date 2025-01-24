import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { env } from "@/env";
import { and, lt, gte, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_expires_in: number;
}

export async function GET() {
  console.log("Starting LinkedIn token refresh cron job");
  try {
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    console.log("Looking for tokens expiring before:", twoDaysFromNow);

    const expiringAccounts = await db
      .select()
      .from(accounts)
      .where(
        and(
          lt(accounts.expires_at, Math.floor(twoDaysFromNow.getTime() / 1000)),
          gte(accounts.expires_at, Math.floor(Date.now() / 1000))
        )
      );

    console.log(
      `Found ${expiringAccounts.length} accounts needing token refresh`
    );

    for (const account of expiringAccounts) {
      console.log(`Processing account for user ${account.userId}`);
      const response = await fetch(
        "https://www.linkedin.com/oauth/v2/accessToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: account.refresh_token ?? "",
            client_id: env.LINKEDIN_CLIENT_ID,
            client_secret: env.LINKEDIN_CLIENT_SECRET,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          `Failed to refresh token for account ${account.userId}. Status: ${response.status}`
        );
        continue;
      }

      console.log(`Successfully received new token for user ${account.userId}`);
      const data = (await response.json()) as TokenResponse;

      await db
        .update(accounts)
        .set({
          access_token: data.access_token,
          expires_at: Date.now() + data.expires_in * 1000,
          refresh_token: data.refresh_token || account.refresh_token,
        })
        .where(eq(accounts.userId, account.userId));

      console.log(`Updated database with new token for user ${account.userId}`);
    }

    console.log("Token refresh process completed successfully");
    return NextResponse.json({ message: "Token refresh process completed" });
  } catch (error) {
    console.error("Error in token refresh cron job:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
