import { env } from "@/env";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
import { getUser } from "@/actions/user";

interface RequestBody {
  question: string;
  answer: string;
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

    const { question, answer, instructions, formatTemplate, contentStyle } =
      body;

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
            You are an expert LinkedIn content strategist specializing in marketing funnel conversion. Your task is to craft a compelling LinkedIn post that strategically answers a key prospect question. Follow these instructions meticulously:

            1. Study these examples from the content creator:
            <creator_examples>
            {${examples}}
            </creator_examples>

            From these examples:
            - Analyze and precisely replicate their unique writing voice, tone, and sentence structures
            - Note their specific formatting patterns, paragraph length, and stylistic elements
            - Identify how they establish authority and present solutions to audience problems
            - DO NOT copy any specific content or information from these examples

            2. Transform this marketing Q&A into a compelling LinkedIn post:
            <question>
            {${question}}
            </question>

            <answer>
            {${answer}}
            </answer>

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
            1. Begin by acknowledging the pain point or challenge reflected in the question
            2. Position the answer as a valuable insight that addresses the specific problem
            3. Maintain authentic human voice - avoid sales-heavy language or marketing jargon
            4. Create visual rhythm with varied paragraph lengths (most should be 1-3 lines for readability)
            5. Include specific examples or mini-case studies that validate your solution approach
            6. Balance providing valuable information with creating curiosity for more (content tension)
            7. End with a subtle, non-aggressive call-to-action that encourages engagement
            8. Keep the post between 1000-1200 characters for optimal engagement
            9. DO NOT use obvious marketing language or direct sales pitches that feel inauthentic
            10. Avoid excessive hashtags or emojis unless they appear in the examples or instructions
            11. Create natural transitions between question context and solution for seamless flow
            
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
