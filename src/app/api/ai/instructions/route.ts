import { NextResponse } from "next/server";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized!" }, { status: 401 });
    }

    const stream = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: `You are tasked with creating instructions for generating a LinkedIn post. These instructions will be used by another AI to create the actual post. Don't cover structure or tone of the post in these instructions. Follow these guidelines:

                    1. Character count: The instructions should say what the total post length will be. (For example: 1000 - 1500 characters for most)

                    2. Strictly avoid using any emojis or hashtags in the post.

                    Here is an example of the instructions you'll be creating:
                    
                    <example>
                    Use the following format:
           
                    {Story}

                    {Bulleted list of takeaways}

                    {1-3 sentences of a conclusion}

                    {Call to action}

                    Don't use any hashtags and don't use any emojis.
                    </example>

                    Generate the instructions now.`,
        },
        {
          role: "assistant",
          content: "Here are the instructions for generating a LinkedIn post:",
        },
      ],
    });

    const encoder = new TextEncoder();
    let wordCount = 0;
    const readable = new ReadableStream({
      async start(controller) {
        let buffer = "";
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            let text = chunk.delta.text;
            buffer += text;
            controller.enqueue(encoder.encode(text));
          }
        }

        // Count words in the buffer
        wordCount = buffer.trim().split(/\s+/).length;

        // Call the setGeneratedWords action with the total word count
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
    console.error("Error generating instructions:", error);
    return NextResponse.json(
      { error: "Failed to generate instructions" },
      { status: 500 }
    );
  }
}
