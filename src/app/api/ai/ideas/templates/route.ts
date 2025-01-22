import { NextResponse } from "next/server";
import { checkAccess } from "@/actions/user";
import { env } from "@/env";

export async function POST(req: Request) {
  //   const hasAccess = await checkAccess();

  //   if (!hasAccess) {
  //     return NextResponse.json(
  //       { success: false, error: "Not authorized!" },
  //       { status: 401 }
  //     );
  //   }

  // Fetch the CSV file
  try {
    const response = await fetch(env.FILE_URL);
    const csvData = await response.text();

    const body = await req.json();
    const { stage } = body as { stage: string };

    // Parse CSV and filter by stage if provided
    const rows = csvData
      .split("\n")
      .map((row) => {
        const [name, prompt, funnel_location, example] = row
          .split(",")
          .map((cell) => cell.trim());
        return { name, prompt, funnel_location, example };
      })
      .filter((row) => !stage || row.funnel_location === stage)
      .filter((row) => row.name && row.prompt); // Filter out empty rows

    // Randomly select up to 6 items
    const shuffled = rows.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 6);

    return NextResponse.json({
      success: true,
      data: selected,
      length: selected.length,
    });
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const response = await fetch(
      "https://ff2w1im896.ufs.sh/f/Hny9aU7MkSTDQgziEolHBtcXJLyKUgbZi3dYeVz7wSR4TOhr"
    );
    const csvData = await response.text();

    // Parse CSV
    const rows = csvData
      .split("\n")
      .map((row) => {
        const [name, prompt, funnel_location, example] = row
          .split(",")
          .map((cell) => cell.trim());
        return { name, prompt, funnel_location, example };
      })
      .filter((row) => row.name && row.prompt); // Filter out empty rows

    // Organize data by funnel stage
    const organizedData = {
      TOFU: rows.filter((row) => row.funnel_location === "TOFU"),
      MOFU: rows.filter((row) => row.funnel_location === "MOFU"),
      BOFU: rows.filter((row) => row.funnel_location === "BOFU"),
    };

    return NextResponse.json({
      success: true,
      data: organizedData,
      counts: {
        TOFU: organizedData.TOFU.length,
        MOFU: organizedData.MOFU.length,
        BOFU: organizedData.BOFU.length,
      },
    });
  } catch (error) {
    console.error("Error fetching or parsing CSV:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
