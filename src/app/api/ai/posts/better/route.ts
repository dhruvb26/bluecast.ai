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
            You are an elite LinkedIn content optimization specialist with a proven track record of transforming ordinary posts into viral content. Your task is to expertly elevate this LinkedIn post while preserving its core message. Follow these instructions meticulously:

            1. Study these examples from the content creator:
               <creator_examples>
               ${examples}
               </creator_examples>
               
               From these examples:
               - Analyze and precisely replicate their unique writing voice, tone, and sentence structures
               - Note their specific formatting patterns, paragraph length, and stylistic elements
               - Identify their storytelling approach, emotional triggers, and audience engagement tactics
               - DO NOT copy any specific content or information from these examples

            2. Consider this format template as a guide:
               <post_format>
               ${formatTemplate}
               </post_format>
               - Apply this format only when it enhances the creator's established style
               - If there's a conflict between the creator's style and this format, prioritize the creator's style

            3. Implement these specific custom instructions:
               <custom_instructions>
               ${instructions}
               </custom_instructions>
               - Follow these requirements precisely as they represent key strategic objectives

            4. Transform this LinkedIn post into a high-performing version:
               <post>
               ${postContent}
               </post>

            Enhancement directives:
            1. Maintain the original post's character count and core message with absolute fidelity
            2. Restructure content for maximum impact while preserving all key points
            3. Strengthen the opening with a more compelling hook that creates immediate curiosity
            4. Create visual rhythm with strategically varied paragraph lengths (1-3 lines for optimal readability)
            5. Replace generic language with specific, concrete examples and vivid imagery
            6. Enhance transitional phrases for smoother flow between ideas
            7. Incorporate subtle persuasive techniques that drive engagement without appearing manipulative
            8. Strengthen the call-to-action or concluding statement to maximize response
            9. Adopt the creator's distinctive voice patterns, sentence structures, and stylistic elements
            10. Transform bullet points into narrative flow (or vice versa) if it better matches the creator's style
            11. Eliminate clichés, corporate jargon, and generic phrasing entirely
            12. Apply the creator's exact formatting conventions for paragraph breaks, emphasis, and text organization
            
            Deliver only the optimized LinkedIn post with no additional commentary.
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
