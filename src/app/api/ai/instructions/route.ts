import { NextResponse } from "next/server";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";
import { env } from "@/env";

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized!" }, { status: 401 });
    }

    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: `You are tasked with creating instructions for generating a LinkedIn post. These instructions will be used by another AI to create the actual post. Don't cover structure or tone of the post in these instructions. Follow these guidelines:

                    1. Character count: The instructions should say what the total post length will be. (For example: 1000 - 1500 characters for most)

                    2. Strictly avoid using any emojis or hashtags in the post.

                    Generate the instructions now.`,
        },
        {
          role: "assistant",
          content: "Understood. I'll create those instructions now:",
        },
      ],
    });

    const encoder = new TextEncoder();
    let isWithinTags = false;
    let wordCount = 0;
    const readable = new ReadableStream({
      async start(controller) {
        let isFirstChunk = true;
        let buffer = "";
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            let text = chunk.delta.text;
            buffer += text;

            if (buffer.includes("<generated>")) {
              isWithinTags = true;
              buffer = buffer.split("<generated>")[1] as any;
              continue;
            }

            if (buffer.includes("</generated>")) {
              isWithinTags = true;
              text = buffer.split("</generated>")[0] as any;
              controller.enqueue(encoder.encode(text));
              wordCount += text
                .split(/\s+/)
                .filter((word: string) => word.length > 0).length;
              controller.close();
              break;
            }

            if (isWithinTags) {
              if (isFirstChunk) {
                text = text.trimStart();
                isFirstChunk = false;
              }
              controller.enqueue(encoder.encode(text));
              wordCount += text
                .split(/\s+/)
                .filter((word: string) => word.length > 0).length;
              buffer = "";
            }
          }
        }
        if (isWithinTags) {
          controller.close();
        }

        // Call the setGeneratedWords action with the total word count
        await setGeneratedWords(wordCount);
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error generating instructions:", error);
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}
