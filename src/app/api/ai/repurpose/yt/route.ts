import { NextResponse } from "next/server";
import { ClientType, Innertube } from "youtubei.js/web";
import { env } from "@/env";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";
import { RepurposeRequestBody } from "@/types";
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

    // Convert YouTube Shorts URL to regular URL if necessary
    const regularUrl = convertToRegularYouTubeUrl(url);

    // Get transcript
    const transcript = await fetchTranscript(regularUrl);

    // Combine transcript text
    const plainText = combineTranscriptText(transcript);

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
          content: `You are a copywriter tasked with writing a 1000-1200 character LinkedIn post. Follow these guidelines:

            1. Do not include a starting idea (one liner) or hook unless one is extracted from the examples provided. Start writing the post directly.
            2. Do not include emojis or hashtags unless specifically mentioned in the custom instructions.

            First, analyze the following examples from the content creator (if given any):

            <creator_examples>
            {${examples}}
            </creator_examples>

            Examine these examples carefully to:
            a) Identify a common format or structure used across the posts
            b) Determine the overall tone and writing style of the creator

            Now, generate a LinkedIn post based on the following inputs:
            <youtube_video_content>
            {${plainText}}
            </youtube_video_content>

            Examine the youtube video's content carefully to:
            a) Identify the main theme of the video

            Post format (note that the creator's style takes precedence over this):
            <post_format>
            {${formatTemplate}}
            </post_format>

            Custom instructions (if any):
            <custom_instructions>
            {${instructions}}
            </custom_instructions>

            When writing the post:
            1. Make it sound like the creator's examples given above.
            2. Incorporate the given youtube content.
            3. Follow the post format provided, but allow the creator's style to override in any case.
            4. Adhere to any custom instructions given.
            5. Ensure the post is between 1000-1200 characters long.

            Do not include the tags in response. Do not include any explanations or comments outside of these tags.`,
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

function combineTranscriptText(transcriptData: string[]): string {
  return transcriptData.join(" ").replace(/\s+/g, " ").trim();
}

function convertToRegularYouTubeUrl(url: string): string {
  // Regular expression to match YouTube Shorts URL
  const shortsRegex =
    /^https?:\/\/(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/i;
  const match = url.match(shortsRegex);

  if (match && match[1]) {
    // If it's a Shorts URL, convert it to a regular YouTube URL
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }

  // If it's not a Shorts URL, return the original URL
  return url;
}

function getVideoId(url: string): string {
  const regularUrl = convertToRegularYouTubeUrl(url);
  const videoIdRegex = /(?:v=|\/)([a-zA-Z0-9_-]{11})/;
  const match = regularUrl.match(videoIdRegex);

  if (match && match[1]) {
    return match[1];
  }

  throw new Error("Invalid YouTube URL");
}
async function fetchTranscript(url: string): Promise<string[]> {
  try {
    const youtube = await Innertube.create({
      lang: "en",
      location: "US",
      retrieve_player: true,
      client_type: ClientType.WEB,
    });

    const videoId = getVideoId(url);
    const info = await youtube.getInfo(videoId);
    const transcriptInfo = await info.getTranscript();

    if (
      !transcriptInfo ||
      !transcriptInfo.transcript ||
      !transcriptInfo.transcript.content
    ) {
      throw new Error("No transcript available for this video");
    }

    const transcriptContent = transcriptInfo.transcript.content;

    if (
      transcriptContent.type !== "TranscriptSearchPanel" ||
      !transcriptContent.body ||
      transcriptContent.body.type !== "TranscriptSegmentList"
    ) {
      throw new Error("Transcript content structure is not as expected");
    }

    const segments = transcriptContent.body.initial_segments;

    if (!Array.isArray(segments)) {
      throw new Error("Transcript segments are not in the expected format");
    }

    const transcriptLines = segments
      .map((segment) => {
        if (
          segment.type === "TranscriptSegment" &&
          segment.snippet &&
          segment.snippet.text
        ) {
          return segment.snippet.text;
        }
        return "";
      })
      .filter((text) => text !== "");

    console.log("Extracted transcript:", transcriptLines);

    return transcriptLines;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    console.log("Detailed error:", JSON.stringify(error, null, 2));
    throw error;
  }
}
