import { NextResponse } from "next/server";
import { env } from "@/env";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";

interface RequestBody {
  storyType: string;
  storyContent: string;
  outcome: string;
  feeling: string;
  lesson: string;
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

    const {
      storyType,
      storyContent,
      outcome,
      feeling,
      lesson,
      formatTemplate,
      instructions,
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
          You are an expert LinkedIn content strategist with proven success creating viral, engaging story-based posts. Follow these instructions meticulously:

          1. Study these examples from the content creator:
          <creator_examples>
          {${examples}}
          </creator_examples>

          From these examples:
          - Analyze and precisely replicate their unique writing voice, tone, and sentence structures
          - Note their specific formatting patterns, paragraph length, and stylistic elements
          - Identify their storytelling approach, especially how they introduce challenges and resolutions
          - DO NOT copy any specific content or information from these examples

          2. Transform this story into a compelling LinkedIn post:
          <story_type>{${storyType}}</story_type>
          <story_content>{${storyContent}}</story_content>
          <outcome>{${outcome}}</outcome>
          <feeling>{${feeling}}</feeling>
          <lesson>{${lesson}}</lesson>

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
          1. Begin with a powerful, attention-grabbing hook that creates curiosity or addresses a pain point
          2. Structure the narrative in a way that builds tension before revealing the outcome
          3. Maintain authentic human voice - avoid corporate jargon and robotic language
          4. Create visual rhythm with varied paragraph lengths (most should be 1-3 lines for readability)
          5. Connect the personal story to universal professional challenges or opportunities
          6. End with the key lesson learned and a thought-provoking question or call-to-action
          7. Keep the post between 1000-1200 characters for optimal engagement
          8. DO NOT use generic openings like "Here's a story that taught me..." unless present in examples
          9. Avoid excessive hashtags or emojis unless they appear in the examples or instructions
          10. Create natural transitions between the story elements for seamless narrative flow
          
          Deliver only the finished LinkedIn post with no additional commentary.`,
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
              .filter((word: string) => word.length > 0).length;
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
