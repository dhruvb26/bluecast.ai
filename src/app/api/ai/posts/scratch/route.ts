import { env } from "@/env";
import { NextResponse } from "next/server";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
import { getUser } from "@/actions/user";

interface RequestBody {
  postContent: string;
  tone: string;
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
      return NextResponse.json(
        { success: false, error: "Not authorized!" },
        { status: 401 }
      );
    }

    const body: RequestBody = await req.json();

    const { postContent, instructions, formatTemplate, contentStyle } = body;

    let examples;
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success) {
        examples = response.data.examples;
        examples = joinExamples(examples);
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
            You are an expert LinkedIn content strategist with proven success creating viral, engaging posts from scratch. Follow these instructions meticulously:

            1. Study these examples from the content creator:
            <creator_examples>
            {${examples}}
            </creator_examples>

            From these examples:
            - Analyze and precisely replicate their unique writing voice, tone, and sentence structures
            - Note their specific formatting patterns, paragraph length, and stylistic elements
            - Identify their approach to introducing topics and engaging with their audience
            - DO NOT copy any specific content or information from these examples

            2. Transform this topic into a compelling LinkedIn post:
            <topic>
            {${postContent}}
            </topic>

            User info (incorporate personal context if appropriate):
            <user_info> 
            {${user}}
            </user_info>

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
            1. Begin with a powerful, attention-grabbing hook that creates curiosity about the topic
            2. Structure content to maximize engagement, with a clear narrative arc or logical flow
            3. Maintain authentic human voice - avoid corporate jargon and robotic language
            4. Create visual rhythm with varied paragraph lengths (most should be 1-3 lines for readability)
            5. Include specific examples, data points, or personal anecdotes that build credibility
            6. End with a thought-provoking question or clear call-to-action that encourages comments
            7. Keep the post between 1000-1200 characters for optimal engagement
            8. DO NOT use generic openings like "I want to talk about..." unless present in examples
            9. Avoid excessive hashtags or emojis unless they appear in the examples or instructions
            10. Create natural transitions between ideas for seamless flow and readability
            
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
