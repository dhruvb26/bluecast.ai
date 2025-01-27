import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { env } from "@/env";
import { RepurposeRequestBody } from "@/types";
import pdf from "pdf-parse/lib/pdf-parse";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
import { linkedInPostPrompt } from "@/utils/prompt-template";

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized!" }, { status: 401 });
    }

    const body: RepurposeRequestBody = await req.json();
    const {
      url,
      instructions,
      formatTemplate,
      engagementQuestion,
      CTA,
      contentStyle,
    } = body;

    const response = await fetch(url);
    const pdfBuffer = await response.arrayBuffer();

    const data = await pdf(Buffer.from(pdfBuffer));

    const extractedText = data.text;

    let examples;
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success) {
        examples = response.data.examples;
        examples = joinExamples(examples);
      }
    }

    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: linkedInPostPrompt
            .replace("{examples}", examples || "")
            .replace("<content>{content}</content>", extractedText)
            .replace("{formatTemplate}", formatTemplate)
            .replace("{instructions}", instructions),
        },
      ],
    });

    const encoder = new TextEncoder();

    let wordCount = 0;
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            const text = chunk.delta.text;
            controller.enqueue(encoder.encode(text));

            // Count words in this chunk
            const wordsInChunk = text
              .split(/\s+/)
              .filter((word) => word.length > 0).length;
            wordCount += wordsInChunk;
          }
        }
        await setGeneratedWords(wordCount);
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
