import { env } from "@/env";
import { NextResponse } from "next/server";
import { checkAccess, setGeneratedWords, getUser } from "@/actions/user";
import { anthropic } from "@/server/model";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";

interface RequestBody {
  postContent: string;
  instructions: string;
  formatTemplate: string;
  contentStyle: string;
}

export async function POST(req: Request) {
  try {
    const hasAccess = await checkAccess();

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Not authorized!" },
        { status: 401 }
      );
    }

    const body: RequestBody = await req.json();
    const { postContent, instructions, formatTemplate, contentStyle } = body;

    let examples = "";
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success && response.data.examples) {
        examples = joinExamples(response.data.examples);
      }
    }

    const user = await getUser();

    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: `
            You are an expert LinkedIn content optimizer. Your task is to enhance a given LinkedIn post while preserving its core message. Follow these guidelines meticulously:

            1. Analyze the content creator's examples:
               <creator_examples>
               ${examples}
               </creator_examples>
               - Identify and replicate the exact structure, formatting, and stylistic elements
               - Mimic the tone, voice, and writing style precisely
               - Reproduce any unique patterns in content presentation
               - Do not use any specific information or content from these examples

            2. Consider the post format, but prioritize the creator's style:
               <post_format>
               ${formatTemplate}
               </post_format>
               - Use this format only if it doesn't conflict with the creator's established style

            3. Implement custom instructions:
               <custom_instructions>
               ${instructions}
               </custom_instructions>
               - Follow these requirements exactly as specified

            4. Rewrite this LinkedIn post:
               <post>
               ${postContent}
               </post>

            Rewriting guidelines:
            1. Match the original post's length exactly
            2. Preserve the core message and key points entirely
            3. Replicate the creator's style, structure, and formatting with precision
            4. Pay attention to number of lines per paragraph and adjust accordingly
            5. Apply the post format only if it aligns perfectly with the creator's style
            6. Implement all custom instructions without exception
            7. Do not introduce any new information or content not present in the original post
            8. If the original post uses bullet points but the examples don't, rewrite without bullet points
            9. Adapt the content structure to match the examples, even if it means reorganizing bullet points into paragraphs or vice versa
            10. Never start with a one liner idea or a hook, get right into the post
            11. Never use emojis or hashtags unless specifically mentioned in the custom instructions
            12. If the topic of the current post doesn't match the examples, rewrite the post using the examples' tone and style. This includes adopting the formatting, structure, and tone (e.g., formal, discrete, humorous) from the examples

            Provide only the rewritten post, without any explanations or additional comments. Ensure strict adherence to all guidelines, especially the instruction to rewrite in the examples' style if the topic differs.
            `,
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
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response(
      JSON.stringify({ success: false, error: "Internal Server Error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
