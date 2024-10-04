// import { NextRequest, NextResponse } from "next/server";
// import { db } from "@/server/db";
// import { users } from "@/server/db/schema";
// import { and, eq, lt } from "drizzle-orm";
// import { env } from "@/env";
// import { clerkClient } from "@clerk/nextjs/server";
// export const dynamic = "force-dynamic";

// export async function GET(req: NextRequest): Promise<Response> {
//   try {
//     if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
//       return NextResponse.json({ error: "Not authorized" }, { status: 401 });
//     }
//   }

// }
