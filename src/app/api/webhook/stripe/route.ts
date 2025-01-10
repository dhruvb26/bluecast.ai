import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { headers } from "next/headers";
import Stripe from "stripe";
import { users, workspaceMembers, workspaces } from "@/server/db/schema";
import { and, eq } from "drizzle-orm";
import { env } from "@/env";
import { clerkClient } from "@clerk/nextjs/server";

const plans = [
  // Pro Monthly
  {
    name: "Pro Monthly",
    link:
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "https://buy.stripe.com/test_fZe5l61pNfrWdOg7ss"
        : "https://buy.stripe.com/eVa7uTcgf4YP0kU8ww",
    priceId:
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1Q32F1RrqqSKPUNWkMQXCrVC"
        : "price_1Pb0w5RrqqSKPUNWGX1T2G3O",
    price: 29,
    duration: "/month",
  },
  // Pro Annual
  {
    name: "Pro Annual",
    link:
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "https://buy.stripe.com/test_fZeeVG2tR1B625y7st"
        : "https://buy.stripe.com/6oEdTh6VV2QH0kU9AB",
    priceId:
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QMOWRRrqqSKPUNWRV27Uiv7"
        : "price_1QN9MVRrqqSKPUNWHqv3bcMM",
    price: 23,
    duration: "/month",
  },
  // Grow Monthly
  {
    name: "Grow Monthly",
    priceId:
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QMOYXRrqqSKPUNWcFVWJIs4"
        : "price_1QN9NyRrqqSKPUNWWwB1zAXa",
    price: 49,
    duration: "/month",
  },
  // Grow Annual
  {
    name: "Grow Annual",
    priceId:
      env.NEXT_PUBLIC_NODE_ENV === "development"
        ? "price_1QLXONRrqqSKPUNW7s5FxANR"
        : "price_1QN9JoRrqqSKPUNWuTZBJWS1",
    price: 39,
    duration: "/month",
  },
];

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});
const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No Stripe Signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const data = event.data.object;
  const eventType = event.type;

  try {
    switch (eventType) {
      case "checkout.session.completed": {
        let session = data as Stripe.Checkout.Session;

        if (!session.customer || typeof session.customer !== "string") {
          return NextResponse.json(
            { error: "Invalid customer ID" },
            { status: 400 }
          );
        }

        const activeUser = await db.query.users.findFirst({
          where: eq(users.email, session.customer_details?.email as string),
        });

        if (activeUser?.stripeCustomerId && activeUser?.stripeSubscriptionId) {
          const activeCustomerId = activeUser.stripeCustomerId;

          const activeSubscriptions = await stripe.subscriptions.list({
            customer: activeCustomerId,
          });

          if (activeSubscriptions.data.length > 0) {
            const activeSubscription = activeSubscriptions.data[0];

            await stripe.subscriptions.cancel(activeSubscription.id);
          } else {
            console.log("No active subscriptions found to cancel");
          }
        } else {
          console.log("No existing stripe customer or subscription found");
        }

        const customerId = session.customer;

        const customer = await stripe.customers.retrieve(customerId);

        if (!session.line_items) {
          session = await stripe.checkout.sessions.retrieve(session.id, {
            expand: ["line_items"],
          });
        }

        const priceId = session.line_items?.data[0]?.price?.id;
        if (!priceId) {
          console.log("Price ID not found");
          return NextResponse.json(
            { error: "Price ID not found" },
            { status: 400 }
          );
        }

        const plan = plans.find((p) => p.priceId === priceId);
        if (!plan) {
          console.log("Plan not found");
          return NextResponse.json(
            { error: "Plan not found" },
            { status: 404 }
          );
        }

        const isPro = plan.name === "Pro Monthly" || plan.name === "Pro Annual";
        const isGrow =
          plan.name === "Grow Monthly" || plan.name === "Grow Annual";

        if ("email" in customer && customer.email) {
          console.log("Searching for user with email:", customer.email);
          const user = await db.query.users.findFirst({
            where: eq(users.email, customer.email),
          });

          if (!user) {
            console.log("User not found in database");
            return NextResponse.json(
              { error: "User not found" },
              { status: 404 }
            );
          }
          console.log("User found:", user.id);

          const subscriptionId = session.subscription as string;
          console.log("Subscription ID from session:", subscriptionId);

          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          console.log("Subscription retrieved:", subscription.id);

          try {
            const adminWorkspaces = await db.query.workspaceMembers.findMany({
              where: and(
                eq(workspaceMembers.userId, user.id),
                eq(workspaceMembers.role, "org:admin")
              ),
              ...(isPro && {
                orderBy: (workspaces, { asc }) => [asc(workspaces.createdAt)],
              }),
            });

            await db
              .update(users)
              .set({
                forYouGeneratedPosts: 0,
                stripeCustomerId: customerId,
                priceId: priceId,
                trialEndsAt: null,
                hasAccess: true,
                specialAccess: false,
                stripeSubscriptionId: subscription.id,
              })
              .where(eq(users.id, user.id));

            await clerkClient().users.updateUserMetadata(user.id, {
              publicMetadata: {
                hasAccess: true,
              },
            });

            if (adminWorkspaces.length > 0) {
              if (isPro && adminWorkspaces.length > 1) {
                await db
                  .update(workspaces)
                  .set({ hasAccess: true })
                  .where(eq(workspaces.id, adminWorkspaces[0].workspaceId));

                for (let i = 1; i < adminWorkspaces.length; i++) {
                  await db
                    .update(workspaces)
                    .set({ hasAccess: false })
                    .where(eq(workspaces.id, adminWorkspaces[i].workspaceId));
                }
              } else if (isGrow) {
                for (const workspace of adminWorkspaces) {
                  await db
                    .update(workspaces)
                    .set({ hasAccess: true })
                    .where(eq(workspaces.id, workspace.workspaceId));
                }
              }
            }

            console.log("Database updated successfully");
          } catch (error) {
            console.error("Error updating database:", error);
            return NextResponse.json(
              { error: "Database update failed" },
              { status: 500 }
            );
          }
        } else {
          console.log("Customer email not found");
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = data as Stripe.Subscription;

        if (
          !subscription.customer ||
          typeof subscription.customer !== "string"
        ) {
          return NextResponse.json(
            { error: "Invalid customer ID" },
            { status: 400 }
          );
        }

        const userWithCustomerId = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, subscription.customer),
        });

        const userId = userWithCustomerId?.id;

        if (!userId) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        await db
          .update(users)
          .set({
            stripeCustomerId: null,
            priceId: null,
            hasAccess: false,
            stripeSubscriptionId: null,
          })
          .where(eq(users.id, userId));

        await clerkClient().users.updateUserMetadata(userId, {
          publicMetadata: {
            hasAccess: false,
          },
        });

        const adminWorkspaces = await db.query.workspaceMembers.findMany({
          where: and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.role, "org:admin")
          ),
        });

        if (adminWorkspaces.length > 0) {
          for (const workspace of adminWorkspaces) {
            await db
              .update(workspaces)
              .set({
                hasAccess: false,
              })
              .where(eq(workspaces.id, workspace.workspaceId));
          }
        }

        break;
      }
      case "invoice.payment_succeeded": {
        const invoice = data as Stripe.Invoice;
        if (invoice.billing_reason !== "subscription_cycle") break;

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );

        const userWithCustomerId = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, subscription.customer as string),
        });

        const userId = userWithCustomerId?.id;
        if (!userId) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        const priceId = subscription.items.data[0].price.id;
        const plan = plans.find((p) => p.priceId === priceId);

        const isPro =
          plan?.name === "Pro Monthly" || plan?.name === "Pro Annual";
        const isGrow =
          plan?.name === "Grow Monthly" || plan?.name === "Grow Annual";

        const adminWorkspaces = await db.query.workspaceMembers.findMany({
          where: and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.role, "org:admin")
          ),
          ...(isPro && {
            orderBy: (workspaces, { asc }) => [asc(workspaces.createdAt)],
          }),
        });

        // Update user access
        await db
          .update(users)
          .set({
            hasAccess: true,
            ...(isPro && { trialEndsAt: null }),
          })
          .where(eq(users.id, userId));

        await clerkClient().users.updateUserMetadata(userId, {
          publicMetadata: {
            hasAccess: true,
          },
        });

        // Update workspace access
        if (adminWorkspaces.length > 0) {
          if (isPro && adminWorkspaces.length > 1) {
            // First workspace gets access, rest don't
            await db
              .update(workspaces)
              .set({ hasAccess: true })
              .where(eq(workspaces.id, adminWorkspaces[0].workspaceId));

            for (let i = 1; i < adminWorkspaces.length; i++) {
              await db
                .update(workspaces)
                .set({ hasAccess: false })
                .where(eq(workspaces.id, adminWorkspaces[i].workspaceId));
            }
          } else if (isGrow) {
            // All workspaces get access
            for (const workspace of adminWorkspaces) {
              await db
                .update(workspaces)
                .set({ hasAccess: true })
                .where(eq(workspaces.id, workspace.workspaceId));
            }
          }
        }

        break;
      }
      case "customer.subscription.updated": {
        const subscription = data as Stripe.Subscription;

        if (
          !subscription.customer ||
          typeof subscription.customer !== "string"
        ) {
          return NextResponse.json(
            { error: "Invalid customer ID" },
            { status: 400 }
          );
        }

        const usersWithSameCustomerId = await db.query.users.findMany({
          where: eq(users.stripeCustomerId, subscription.customer),
        });

        if (!usersWithSameCustomerId) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        for (const user of usersWithSameCustomerId) {
          await db
            .update(users)
            .set({
              hasAccess: subscription.status === "active",
            })
            .where(eq(users.id, user.id));

          await clerkClient().users.updateUserMetadata(user.id, {
            publicMetadata: {
              hasAccess: subscription.status === "active",
            },
          });
        }

        break;
      }
      case "invoice.payment_failed": {
        const invoice = data as Stripe.Invoice;
        const subscriptionId = invoice.subscription as string;
        const subscription = await stripe.subscriptions.retrieve(
          subscriptionId
        );

        const userWithCustomerId = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, subscription.customer as string),
        });

        const userId = userWithCustomerId?.id;

        if (!userId) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        await db
          .update(users)
          .set({
            hasAccess: false,
          })
          .where(eq(users.id, userId));

        await clerkClient().users.updateUserMetadata(userId, {
          publicMetadata: {
            hasAccess: false,
          },
        });

        const adminWorkspaces = await db.query.workspaceMembers.findMany({
          where: and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.role, "org:admin")
          ),
        });

        if (adminWorkspaces.length > 0) {
          for (const workspace of adminWorkspaces) {
            await db
              .update(workspaces)
              .set({
                hasAccess: false,
              })
              .where(eq(workspaces.id, workspace.workspaceId));
          }
        }
        break;
      }
      case "charge.refunded": {
        const charge = data as Stripe.Charge;

        if (!charge.customer || typeof charge.customer !== "string") {
          return NextResponse.json(
            { error: "Invalid customer ID" },
            { status: 400 }
          );
        }

        const userWithCustomerId = await db.query.users.findFirst({
          where: eq(users.stripeCustomerId, charge.customer),
        });

        const userId = userWithCustomerId?.id;

        if (!userId) {
          return NextResponse.json(
            { error: "User not found" },
            { status: 404 }
          );
        }

        await db
          .update(users)
          .set({
            hasAccess: false,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
            priceId: null,
          })
          .where(eq(users.id, userId));

        await clerkClient().users.updateUserMetadata(userId, {
          publicMetadata: {
            hasAccess: false,
          },
        });

        const adminWorkspaces = await db.query.workspaceMembers.findMany({
          where: and(
            eq(workspaceMembers.userId, userId),
            eq(workspaceMembers.role, "org:admin")
          ),
        });

        if (adminWorkspaces.length > 0) {
          for (const workspace of adminWorkspaces) {
            await db
              .update(workspaces)
              .set({
                hasAccess: false,
              })
              .where(eq(workspaces.id, workspace.workspaceId));
          }
        }
        break;
      }
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }
  } catch (err: any) {
    console.error("Webhook event processing error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
