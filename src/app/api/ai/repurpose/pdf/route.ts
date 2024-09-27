import { NextResponse } from "next/server";
import { anthropic } from "@/server/model";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { env } from "@/env";
import { RepurposeRequestBody } from "@/types";
import pdf from "pdf-parse/lib/pdf-parse";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";

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

    const response = await fetch(url);
    const pdfBuffer = await response.arrayBuffer();

    const data = await pdf(Buffer.from(pdfBuffer));

    const extractedText = data.text;

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
          content: `You are tasked with writing a LinkedIn post based on text extracted from a PDF. Your goal is to create an engaging and professional post that accurately represents the content while adhering to any provided instructions, format templates, and writing styles.

                    First, carefully read the following text extracted from the PDF:

                    <pdf_text>
                    {${extractedText}}
                    </pdf_text>

                    Now, consider any additional instructions for creating the post:

                    <additional_instructions>
                    {${instructions}}
                    </additional_instructions>

                    If a format template has been provided, use it as a structural guide for your post:

                    <format_template>
                    {${formatTemplate}}
                    </format_template>

                    If writing style examples have been provided, analyze them and emulate their tone and style in your post:

                    <writing_style_examples>
                    {${examples}}
                    </writing_style_examples>

                    Guidelines for creating the LinkedIn post:

                    1. Summarize the key points from the PDF text concisely.
                    2. Ensure the post is appropriate for a professional LinkedIn audience.
                    3. Use clear, engaging language that encourages reader interaction.
                    4. Include relevant hashtags if appropriate for the content.
                    5. Keep the post length appropriate for LinkedIn (typically 1300 characters or less).
                    6. If specific instructions were provided, make sure to follow them precisely.
                    7. If a format template was given, adhere to its structure while filling in the content.
                    8. If writing style examples were provided, emulate their tone, vocabulary, and sentence structure.

                    Write your LinkedIn post inside <linkedin_post> tags. Before writing the post, you may use <scratchpad> tags to organize your thoughts and plan your approach if needed.

                    Remember to craft a post that is informative, engaging, and tailored to the LinkedIn platform while accurately representing the content from the PDF.

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
