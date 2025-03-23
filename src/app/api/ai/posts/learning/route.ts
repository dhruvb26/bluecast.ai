import { env } from "@/env";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";

interface RequestBody {
  learning: string;
  how: string;
  takeaways: string;
  instructions: string;
  formatTemplate: string;
  contentStyle: string;
}

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ ideas: "Not authorized!" }, { status: 401 });
    }

    const body: RequestBody = await req.json();

    const {
      learning,
      how,
      takeaways,
      instructions,
      formatTemplate,
      contentStyle,
    } = body;

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
          content: `
            You are an expert LinkedIn content strategist with proven success creating viral, engaging learning-focused posts. Follow these instructions meticulously:

            1. Study these examples from the content creator:
            <creator_examples>
            {${examples}}
            </creator_examples>

            From these examples:
            - Analyze and precisely replicate their unique writing voice, tone, and sentence structures
            - Note their specific formatting patterns, paragraph length, and stylistic elements
            - Identify how they share insights and lessons to position themselves as thought leaders
            - DO NOT copy any specific content or information from these examples

            2. Transform this learning experience into a compelling LinkedIn post:
            <learning>
            What was the learning?
            {${learning}}
            </learning>

            <how> 
            How was the learning learnt?
            {${how}}
            </how>

            <key_takeaways>
            What were the takeaways?
            {${takeaways}}
            </key_takeaways>

            3. Consider this format template as a guide:
            <post_format>
            {${formatTemplate}}
            </post_format>
            - Apply this format only when it enhances the creator's established style
            - If there's a conflict between the creator's style and this format, prioritize the creator's style

            4. Implement these specific custom instructions:
            <custom_instructions>
            {${instructions}}
            </custom_instructions>
            - Follow these requirements precisely as they represent key strategic objectives

            Writing directives:
            1. Begin with a powerful, attention-grabbing hook that creates curiosity about the learning experience
            2. Structure the narrative to show a clear before/after transformation from the learning
            3. Maintain authentic human voice - avoid corporate jargon and pedagogical language
            4. Create visual rhythm with varied paragraph lengths (most should be 1-3 lines for readability)
            5. Include specific examples that illustrate how the learning was applied practically
            6. End with the most valuable takeaway and a thought-provoking question or call-to-action
            7. Keep the post between 1000-1200 characters for optimal engagement
            8. DO NOT use generic openings like "I learned something important..." unless present in examples
            9. Avoid excessive hashtags or emojis unless they appear in the examples or instructions
            10. Create natural transitions between the learning elements for seamless narrative flow
            
            Deliver only the finished LinkedIn post with no additional commentary.
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
