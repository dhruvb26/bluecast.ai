import Stripe from "stripe";
import { getUser } from "@/actions/user";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { db } from "@/server/db";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-06-20",
});

export async function POST(req: Request) {
  try {
    const { priceId, user } = (await req.json()) as any;

    // Check if the user already has an active subscription
    const dbUser = await db.query.users.findFirst({
      where: eq(users.email, user.email),
    });

    const customer = await stripe.customers.create({
      name: user.name || "",
      email: user.email || "",
    });

    const customer_id = customer.id;

    const session = await stripe.checkout.sessions.create({
      customer: customer_id,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${env.BASE_URL}/create/posts`,
      cancel_url: `${env.BASE_URL}/pricing`,
      allow_promotion_codes: true,
      metadata: {
        dbId: user.id,
      },
    });

    console.log("Session ID: ", session.id);
    console.log("Session URL: ", session.url);

    return NextResponse.json({ sessionUrl: session.url });
  } catch (err: any) {
    console.error("Error in POST /api/stripe/session:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
