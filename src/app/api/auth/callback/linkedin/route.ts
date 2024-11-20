import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { accounts, users, workspaces } from "@/server/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const user = await currentUser();
  const { sessionClaims } = auth();
  const workspaceId = sessionClaims?.metadata?.activeWorkspaceId as
    | string
    | undefined;

  console.log("User: ", user);
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (state !== "foobar") {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://www.linkedin.com/oauth/v2/accessToken",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          redirect_uri: env.CALLBACK_URL,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token");
    }

    const tokenData: any = await tokenResponse.json();

    console.log("Response from LinkedIn: ", tokenData);
    const access_token = tokenData.access_token;
    const expires_in = tokenData.expires_in;
    const expires_at = Date.now() + tokenData.expires_in * 1000;
    const refresh_token = tokenData.refresh_token;
    const refresh_token_expires_in = tokenData.refresh_token_expires_in;
    const scope = tokenData.scope;
    const token_type = tokenData.token_type;
    const id_token = tokenData.id_token;

    // Fetch user profile data from LinkedIn
    const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch LinkedIn profile");
    }

    const profileData: any = await profileResponse.json();

    // Extract relevant information
    const firstName = profileData.localizedFirstName;
    const lastName = profileData.localizedLastName;
    const fullName = `${firstName} ${lastName}`;
    const headline = profileData.localizedHeadline;
    const linkedInId = profileData.id;
    const email = profileData.emailAddress;

    // Fetch profile picture URL
    let profilePictureUrl = null;
    const profilePictureResponse: any = await fetch(
      "https://api.linkedin.com/v2/me?projection=(id,profilePicture(displayImage~digitalmediaAsset:playableStreams))",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    if (profilePictureResponse.ok) {
      const profilePictureData = await profilePictureResponse.json();
      const elements =
        profilePictureData.profilePicture?.["displayImage~"]?.elements;
      if (elements && elements.length > 0) {
        const identifiers = elements[0].identifiers;
        if (identifiers && identifiers.length > 0) {
          profilePictureUrl = identifiers[0].identifier;
        }
      }
    } else {
      console.error("Failed to fetch profile picture URL");
    }

    if (user) {
      if (!workspaceId) {
        await db
          .update(users)
          .set({
            name: fullName,
            headline: headline,
            linkedInId: linkedInId,
            image: profilePictureUrl,
          })
          .where(eq(users.id, user.id));
      } else {
        await db
          .update(workspaces)
          .set({
            linkedInName: fullName,
            linkedInImageUrl: profilePictureUrl,
            linkedInHeadline: headline,
          })
          .where(eq(workspaces.userId, user.id));
      }
    }

    if (user) {
      // Check if the account already exists
      const existingAccount = await db
        .select()
        .from(accounts)
        .where(
          and(
            eq(accounts.userId, user.id),
            eq(accounts.provider, "linkedin"),
            eq(accounts.providerAccountId, linkedInId),
            workspaceId
              ? eq(accounts.workspaceId, workspaceId)
              : isNull(accounts.workspaceId)
          )
        )
        .limit(1);

      if (existingAccount.length === 0) {
        // If the account doesn't exist, insert it
        await db.insert(accounts).values({
          userId: user.id,
          provider: "linkedin",
          providerAccountId: linkedInId,
          access_token,
          expires_in,
          refresh_token,
          refresh_token_expires_in,
          scope,
          expires_at,
          token_type,
          id_token,
          workspaceId: workspaceId || null,
        });
      } else {
        // If the account exists, update it
        await db
          .update(accounts)
          .set({
            access_token,
            expires_in,
            refresh_token,
            refresh_token_expires_in,
            scope,
            expires_at,
            token_type,
            id_token,
          })
          .where(
            and(
              eq(accounts.userId, user.id),
              eq(accounts.provider, "linkedin"),
              eq(accounts.providerAccountId, linkedInId),
              workspaceId
                ? eq(accounts.workspaceId, workspaceId)
                : isNull(accounts.workspaceId)
            )
          );
      }
    }

    return NextResponse.redirect(new URL("/create/posts", request.url), 307);
  } catch (error) {
    console.error("Error during LinkedIn authentication:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
