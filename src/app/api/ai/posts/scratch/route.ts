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

    console.log("Examples:\n", examples);

    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: `
            You are a copywriter tasked with writing a 1000-1200 character LinkedIn post. Follow these guidelines:

            1. Do not include a starting idea (one liner) or hook unless one is extracted from the examples provided. Start writing the post directly.
            2. Do not include emojis or hashtags unless specifically mentioned in the custom instructions.

            First, analyze the following examples from the content creator (if given any):

            <creator_examples>
            {${examples}}
            </creator_examples>

            Examine these examples carefully to:
            a) Identify a common format or structure used across the posts
            b) Identify any common hooks or CTAs in the examples and use those for post generation unless explicitly asked not to
            c) Determine the overall tone and writing style of the creator
            d) Do not pull any sensitive or proprietary information from the examples unless explicitly asked for by the user in instructions. 

            Now, generate a LinkedIn post based on the following inputs:

            Topic of the post:
            <topic>
            {${postContent}}
            </topic>

            User info (some user information to use if post requires personal information):
            <user_info> 
            {${user}}
            </user_info>

            Post format (note that the creator's style takes precedence over this):
            <post_format>
            {${formatTemplate}}
            </post_format>

            Custom instructions (if any):
            <custom_instructions>
            {${instructions}}
            </custom_instructions>

            When writing the post:
            1. Prioritize the format, style and tone identified from the creator's examples.
            2. Incorporate the given topic.
            3. Follow the post format provided, but allow the creator's style to override if there are conflicts.
            4. Adhere to any custom instructions given.
            5. Ensure the post is between 1000-1200 characters long.
            6. Never start with a one liner idea or a hook.

            Do not include the tags in response. Do not include any explanations or comments outside of these tags.
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
        controller.close();
      },
    });
    await setGeneratedWords(wordCount);
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
