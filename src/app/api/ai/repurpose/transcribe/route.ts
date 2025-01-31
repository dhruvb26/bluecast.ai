import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { AssemblyAI } from "assemblyai";
import { env } from "@/env";
import { RepurposeRequestBody } from "@/types";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
export const maxDuration = 180;

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized!" }, { status: 401 });
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

    let examples: string[] = [];
    let examplesString = "";
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success) {
        examples = response.data.examples;
        examplesString = joinExamples(examples);
      }
    }

    let prompt = `You are a highly skilled LinkedIn content writer. Your task is to write a LinkedIn post. Think step by step and follow these guidelines meticulously:\n\n`;

    // Incorporate few-shot prompting if examples are present
    if (examples) {
      prompt += `**Examples of the creator's previous posts:**\n${examplesString}\n\n`;
    }

    // Add instructions if present
    if (instructions) {
      prompt += `**Custom Instructions:**\n${instructions}\n\n`;
    }

    // Add format template if present
    if (formatTemplate) {
      prompt += `**Post Format:**\n${formatTemplate}\n\n`;
    }

    prompt += `**Content to base the post on:**\n${transcript.text}\n\n`;

    // Writing guidelines
    prompt += `**Writing Guidelines:**\n`;
    prompt += `1. Match the length of the example posts exactly\n`;
    prompt += `2. Preserve the core message and key points entirely\n`;
    prompt += `3. Replicate the creator's style, structure, and formatting with precision\n`;
    prompt += `4. Pay attention to number of lines per paragraph and adjust accordingly\n`;
    if (formatTemplate) {
      prompt += `5. Apply the post format only if it matches the creator's style\n`;
    }
    if (instructions) {
      prompt += `6. Implement all custom instructions without exception\n`;
    }
    prompt += `7. Enhance readability and impact without altering the fundamental content\n`;
    prompt += `8. DO NOT introduce any new information or content not present in the original post\n`;
    prompt += `9. Adapt the content structure to match the examples, even if it means reorganizing bullet points into paragraphs or vice versa\n`;
    prompt += `10. NEVER start with a one liner idea or a hook, get right into the post\n`;
    prompt += `11. NEVER use emojis or hashtags unless specifically mentioned in the custom instructions\n`;
    prompt += `12. If the examples don't use bullet points, don't use bullet points\n`;
    prompt += `13. DO NOT use any information outside of the given content\n\n`;
    prompt += `Provide only the rewritten post, without any explanations or additional comments.`;

    // Create the stream for generating LinkedIn post
    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: prompt,
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
