import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { AssemblyAI } from "assemblyai";
import { env } from "@/env";
import { RepurposeRequestBody } from "@/types";
import { getContentStyle } from "@/actions/style";

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body: RepurposeRequestBody = await req.json();
    const {
      url,
      instructions,
      formatTemplate,
      engagementQuestion,
      CTA,
      contentStyle,
    } = body;

    // Transcribe the audio
    const client = new AssemblyAI({
      apiKey: env.ASSEMBLY_API_KEY,
    });

    const config = {
      audio_url: url,
    };

    const transcript = await client.transcripts.transcribe(config);

    if (!transcript.text) {
      throw new Error("Failed to transcribe audio");
    }

    let examples;
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success) {
        examples = response.data.examples;
      }
    }

    // Create the stream for generating LinkedIn post
    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: `You are tasked with creating an informative LinkedIn post based on a transcribed audio content. Your goal is to understand the context of the transcription and generate a post that captures its key points and value.

                    First, carefully read and analyze the following transcription content:

                    <transcription_content>
                    ${transcript.text}
                    </transcription_content>

                    As you analyze the content, pay attention to:
                    1. The main topic or theme of the transcription
                    2. Key points or arguments presented
                    3. Any notable quotes or statistics
                    4. The overall message or takeaway

                    Based on your analysis, create a LinkedIn post that:
                    1. Summarizes the main idea of the transcribed content
                    2. Highlights 2-3 key points or insights
                    3. Is concise and engaging, suitable for a professional audience on LinkedIn
                    4. Contains about 200-250 words

                    If custom instructions are provided, incorporate them into your post creation process:
                    <custom_instructions>
                    ${instructions}
                    </custom_instructions>

                    If a format template is provided, use it to structure your post:
                    <format_template>
                    ${formatTemplate}
                    </format_template>

                    <writing_style>
                    ${examples}
                    </writing_style>

                    If no custom instructions, format template, CTA, or engagement questions are provided, use your best judgment to create an informative and engaging LinkedIn post.

                    Use relevant emoticons unless specifically instructed not to in the custom instructions. Do not include hashtags unless explicitly mentioned in the custom instructions.

                    Important: Generate and output only the content of the LinkedIn post directly. Do not include any XML tags, metadata, or additional commentary. The post should be ready to be shared on LinkedIn as-is.`,
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

        // Call the setGeneratedWords action with the total word count
        await setGeneratedWords(wordCount);
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
