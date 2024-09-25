import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { env } from "@/env";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Process the webhook event
  const eventType = evt.type;

  // Update user data in the database
  if (eventType === "user.created") {
    const { id, first_name, last_name, image_url, email_addresses } = evt.data;

    await clerkClient().users.updateUserMetadata(id, {
      publicMetadata: {
        hasAccess: true,
      },
    });

    const updateData = {
      id,
      name: `${first_name} ${last_name}`.trim(),
      email: email_addresses[0].email_address,
      image: image_url,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    await db.insert(users).values(updateData).onConflictDoUpdate({
      target: users.id,
      set: updateData,
    });
  }

  if (eventType === "user.updated") {
    const { id, first_name, last_name, image_url, email_addresses } = evt.data;

    const updateData: Partial<typeof users.$inferInsert> = {
      name: `${first_name} ${last_name}`.trim(),
      email: email_addresses[0].email_address,
    };

    const existingUser = await db
      .select({ image: users.image })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    const currentImage = existingUser[0]?.image;

    if (image_url && image_url.startsWith("https://img.clerk.com/")) {
      if (!currentImage || currentImage.startsWith("https://img.clerk.com/")) {
        updateData.image = image_url;
      }
    }

    await db.update(users).set(updateData).where(eq(users.id, id));
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;

    if (typeof id === "string") {
      await db.delete(users).where(eq(users.id, id));
    } else {
      console.error("Invalid user ID for deletion:", id);
    }
  }

  return new Response("", { status: 200 });
}
