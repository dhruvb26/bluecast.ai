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
          You are tasked with writing a compelling story post for LinkedIn. Your goal is to create an engaging narrative that resonates with professional audiences while conveying a meaningful message or lesson. Follow these instructions carefully to craft your post:

          1. Begin by reviewing the input variables provided:
          <story_type>{${storyType}}</story_type>
          <story_content>{${storyContent}}</story_content>
          <outcome>{${outcome}}</outcome>
          <feeling>{${feeling}}</feeling>
          <lesson>{${lesson}}</lesson>

          2. Check if a specific format template or custom instructions have been provided:
          <format_template>{${formatTemplate}}</format_template>
          <custom_instructions>{${instructions}}</custom_instructions>
          <writing_style>{${examples}}</writing_style>

          If a format template or custom instructions are provided, you must strictly adhere to them throughout the writing process. These take precedence over the general guidelines that follow.

          3. If no specific template or custom instructions are given, structure your story post as follows:
            a. Hook: Start with an attention-grabbing opening line or question related to the story type.
            b. Context: Briefly set the scene or provide necessary background information.
            c. Main content: Develop the story using the provided story content, focusing on key events or challenges.
            d. Outcome: Describe the result or resolution, incorporating the given outcome.
            e. Emotional impact: Express the feeling associated with the experience.
            f. Lesson or takeaway: Conclude with the main lesson learned or insight gained.

          4. Writing style and tone:
            - Keep the language professional yet conversational.
            - Use short paragraphs and sentences for easy readability on LinkedIn.
            - Incorporate relevant hashtags where appropriate.
            - Aim for a word count between 150-300 words, unless specified otherwise in the custom instructions.

          5. Before finalizing your post, review it to ensure:
            - The story flows logically and engagingly.
            - The main points (story content, outcome, feeling, and lesson) are clearly conveyed.
            - The post aligns with LinkedIn's professional context.
            - Any format template or custom instructions have been followed precisely.

          6. Present your final LinkedIn story post directly, without any surrounding tags.

          7. If user asks for bolded or italic text use unicode text instead of markdown format.

          Remember, your goal is to create a post that is both authentic and inspiring, encouraging engagement from LinkedIn users. Craft your story in a way that professionals can relate to and find value in.`,
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
        controller.close();

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
