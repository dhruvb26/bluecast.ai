import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { env } from "@/env";
import { RepurposeRequestBody } from "@/types";
import { PDFExtract } from "pdf.js-extract";
import pdf from "pdf-parse";

export async function POST(req: Request) {
  try {
    // ... existing code ...

    const body: RepurposeRequestBody = await req.json();
    const {
      url,
      instructions,
      formatTemplate,
      engagementQuestion,
      CTA,
      contentStyle,
    } = body;

    // Fetch the PDF file
    // Fetch the PDF file
    const response = await fetch(url);
    const pdfBuffer = await response.arrayBuffer();

    // Extract text from the PDF
    const pdfExtract = new PDFExtract();
    const data = await pdfExtract.extractBuffer(Buffer.from(pdfBuffer));

    // Combine all page content into a single string
    const extractedText = data.pages
      .map((page) => page.content.map((item) => item.str).join(" "))
      .join("\n");

    // Log the extracted text
    console.log("Extracted text from PDF:", extractedText);

    // ... rest of your code ...
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
