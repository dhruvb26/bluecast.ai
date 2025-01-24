import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
export const dynamic = "force-dynamic";
import type { updateInspiration } from "@/trigger/inspiration";
import { tasks } from "@trigger.dev/sdk/v3";

export async function GET(req: NextRequest): Promise<Response> {
  try {
    if (req.headers.get("Authorization") !== `Bearer ${env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await tasks.trigger<typeof updateInspiration>("update-inspiration", {
      type: "DECLARATIVE",
      timestamp: new Date(),
      timezone: "UTC",
      scheduleId: "inspiration-update",
      upcoming: [],
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating inspiration:", error);
    return NextResponse.json(
      { error: "Error updating inspiration" },
      { status: 500 }
    );
  }
}
