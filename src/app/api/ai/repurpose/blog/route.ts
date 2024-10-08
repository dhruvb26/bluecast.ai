import { NextResponse } from "next/server";
import { env } from "@/env";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { RepurposeRequestBody } from "@/types";
import { anthropic } from "@/server/model";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import chromium from "@sparticuz/chromium-min";
import puppeteerExtra from "puppeteer-extra";
puppeteerExtra.use(StealthPlugin());

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    // Get the user session
    const hasAccess = await checkAccess();

    // Check if the user has access
    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const body: RepurposeRequestBody = await req.json();
    const { url, instructions, formatTemplate, contentStyle } = body;

    let data;

    try {
      // const options = env.NODE_ENV
      //   ? {
      //       args: chromium.args,
      //       defaultViewport: chromium.defaultViewport,
      //       executablePath: await chromium.executablePath(),
      //       headless: true,
      //     }
      //   : {
      //       args: [],
      //       executablePath:
      //         process.platform === "win32"
      //           ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
      //           : process.platform === "linux"
      //           ? "/usr/bin/google-chrome"
      //           : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      //     };

      const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;

      const options = {
        args: isLocal ? puppeteerExtra.defaultArgs() : chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath:
          process.env.CHROME_EXECUTABLE_PATH ||
          (await chromium.executablePath(
            "https://utfs.io/f/Hny9aU7MkSTDPwsFPO8WauwPiRvmCf8zTpQgHbnVkB0EYeLO"
          )),
        headless: true,
      };
      const browser = await puppeteerExtra.launch(options);

      const page = await browser.newPage();

      // Increase timeout to 60 seconds and add error handling
      await page
        .goto(url, {
          waitUntil: "networkidle0",
          timeout: 60000, // 60 seconds
        })
        .catch(async (err: any) => {
          console.log("Navigation timeout, attempting to get content anyway");
          // Even if navigation times out, we can still try to get the content
        });

      // Wait for the body to be present
      await page.waitForSelector("body", { timeout: 60000 }).catch(() => {
        console.log(
          "Timeout waiting for body, attempting to get content anyway"
        );
      });

      const content = await page.content();
      await browser.close();

      data = { content };
    } catch (puppeteerError: any) {
      console.log("Puppeteer Stealth failed:", puppeteerError);
      throw new Error("Failed to extract content from the URL");
    }
    // }

    if (!data || !data.content) {
      throw new Error("Failed to extract content from the URL");
    }

    // Clean up the extracted content
    const cleanContent = data.content
      .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
      .replace(/\n+/g, "\n") // Replace multiple newlines with a single newline
      .trim(); // Remove leading and trailing whitespace

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
          You are a copywriter tasked with writing a 1000-1200 character LinkedIn post. Follow these guidelines:

            1. Do not include a starting idea or hook unless one is extracted from the examples provided.
            2. Do not include emojis or hashtags unless specifically mentioned in the custom instructions.

            First, analyze the following examples from the content creator (if given any):

            <creator_examples>
            {${examples}}
            </creator_examples>

            Examine these examples carefully to:
            a) Identify a common format or structure used across the posts
            b) Determine the overall tone and writing style of the creator

            Now, generate a LinkedIn post based on the following inputs:
            <article_content>
            {${cleanContent}}
            </article_content>

            Examine the article content carefully to:
            a) Identify the main theme and key topics of the article
            b) Determine the core message
            c) Extract any notable quotes, statistics, or insights that could be highlighted

            Post format (note that the creator's style takes precedence over this):
            <post_format>
            {${formatTemplate}}
            </post_format>

            Custom instructions (if any):
            <custom_instructions>
            {${instructions}}
            </custom_instructions>

            When writing the post:
            1. Prioritize the format identified from the creator's examples.
            2. Incorporate the given article content.
            3. Follow the post format provided, but allow the creator's style to override if there are conflicts.
            4. Adhere to any custom instructions given.
            5. Ensure the post is between 1000-1200 characters long.

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
