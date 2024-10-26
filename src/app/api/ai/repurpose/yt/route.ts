import { NextResponse } from "next/server";
import { ClientType, Innertube } from "youtubei.js/web";
import { env } from "@/env";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";
import { RepurposeRequestBody } from "@/types";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
import { linkedInPostPrompt } from "@/utils/prompt-template";
import { Linkedin } from "lucide-react";

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

    // Convert YouTube Shorts URL to regular URL if necessary
    const regularUrl = convertToRegularYouTubeUrl(url);

    // Get transcript
    const transcript = await fetchTranscript(regularUrl);

    // Combine transcript text
    // const plainText = combineTranscriptText(transcript);

    let examples;
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success) {
        examples = response.data.examples;
        examples = joinExamples(examples);
      }
    }
    const plainText = `This is a transcript from a YouTube video. Understand the main topic and context of the video and draft a LinkedIn post sharing the main points:<content>\n\n${combineTranscriptText(
      transcript
    )}</content>`;

    const stream = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      stream: true,
      messages: [
        {
          role: "user",
          content: linkedInPostPrompt
            .replace("{examples}", examples || "")
            .replace("<content>{content}</content>", plainText)
            .replace("{formatTemplate}", formatTemplate)
            .replace("{instructions}", instructions),
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

    return transcriptLines;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    console.log("Detailed error:", JSON.stringify(error, null, 2));
    throw error;
  }
}
