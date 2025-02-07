import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
export const dynamic = "force-dynamic";
import type { updateCreatorProfile } from "@/trigger/update-creator-profile";
import { tasks } from "@trigger.dev/sdk/v3";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await tasks.trigger<typeof updateCreatorProfile>(
      "update-creator-profile",
      { lastProcessedId: "0" },
      { metadata: { lastProcessedId: "0" } }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating inspiration:", error);
    return NextResponse.json(
      { error: "Error updating inspiration" },
      { status: 500 }
    );
  }
}
