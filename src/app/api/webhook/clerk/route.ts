import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { users, workspaceMembers, workspaces } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";
import { v4 as uuidv4 } from "uuid";
import { env } from "@/env";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

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

  try {
    const eventType = evt.type;

    switch (eventType) {
      case "user.created": {
        const { id, first_name, last_name, image_url, email_addresses } =
          evt.data;

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
        break;
      }

      case "user.updated": {
        const { id, first_name, last_name, image_url, email_addresses } =
          evt.data;

        const existingUser = await db
          .select({
            image: users.image,
            priceId: users.priceId,
            stripeCustomerId: users.stripeCustomerId,
            stripeSubscriptionId: users.stripeSubscriptionId,
            trialEndsAt: users.trialEndsAt,
            metadata: users.metadata,
          })
          .from(users)
          .where(eq(users.id, id))
          .limit(1);

        const updateData: Partial<typeof users.$inferInsert> = {
          name: `${first_name} ${last_name}`.trim(),
          email: email_addresses[0].email_address,
        };

        if (existingUser[0]?.metadata?.isInvited) {
          updateData.priceId = existingUser[0].priceId;
          updateData.stripeCustomerId = existingUser[0].stripeCustomerId;
          updateData.stripeSubscriptionId =
            existingUser[0].stripeSubscriptionId;
          updateData.trialEndsAt = existingUser[0].trialEndsAt;
          updateData.metadata = existingUser[0].metadata;
        }

        if (image_url && image_url.startsWith("https://img.clerk.com/")) {
          const currentImage = existingUser[0]?.image;
          if (
            !currentImage ||
            currentImage.startsWith("https://img.clerk.com/")
          ) {
            updateData.image = image_url;
          }
        }

        await db.update(users).set(updateData).where(eq(users.id, id));
        break;
      }

      case "user.deleted": {
        const { id } = evt.data;
        if (typeof id === "string") {
          await db.delete(users).where(eq(users.id, id));
        } else {
          console.error("Invalid user ID for deletion:", id);
        }
        break;
      }

      case "organization.created": {
        const { id, name, slug, created_by } = evt.data;
        const user = await db
          .select()
          .from(users)
          .where(eq(users.id, created_by));

        await db.insert(workspaces).values({
          id,
          name,
          userId: user[0].id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        break;
      }

      case "organization.updated": {
        const { id, name } = evt.data;
        await db.update(workspaces).set({ name }).where(eq(workspaces.id, id));
        break;
      }

      case "organization.deleted": {
        const { id } = evt.data;
        await db
          .delete(workspaceMembers)
          .where(eq(workspaceMembers.workspaceId, id || ""));
        break;
      }

      case "organizationInvitation.created": {
        const { public_metadata } = evt.data;
        console.log(public_metadata);
        break;
      }

      case "organizationInvitation.accepted": {
        const { public_metadata, role, email_address } = evt.data;

        const isInvited = public_metadata?.isInvited === true;
        const invitedToWorkspace = public_metadata?.invitedToWorkspace;
        const inviterUserId = public_metadata?.inviterUserId;

        const inviter = await db.query.users.findFirst({
          where: eq(users.id, inviterUserId as string),
        });

        const updateData = {
          priceId: isInvited ? inviter?.priceId : undefined,
          stripeCustomerId: isInvited ? inviter?.stripeCustomerId : undefined,
          stripeSubscriptionId: isInvited
            ? inviter?.stripeSubscriptionId
            : undefined,
          trialEndsAt: isInvited
            ? null
            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          specialAccess: false,
          hasAccess: true,
          metadata: {
            isInvited: isInvited || false,
            invitedToWorkspace: invitedToWorkspace || "",
            inviterUserId: inviterUserId || "",
            role: role as "org:admin" | "org:member" | "org:client",
          },
        };
        const user = await db.query.users.findFirst({
          where: eq(users.email, email_address),
        });

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.email, email_address));

        await clerkClient().users.updateUserMetadata(user?.id || "", {
          publicMetadata: {
            hasAccess: true,
            activeWorkspaceId: invitedToWorkspace as string,
          },
        });

        await db.insert(workspaceMembers).values({
          id: uuidv4(),
          userId: user?.id || "",
          workspaceId: invitedToWorkspace as string,
          role: role as "org:admin" | "org:member" | "org:client",
        });
        break;
      }
    }

    return new Response("", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}
