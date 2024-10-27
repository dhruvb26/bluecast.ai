import { env } from "@/env";
import { NextResponse } from "next/server";
import { checkAccess, setGeneratedWords } from "@/actions/user";
import { anthropic } from "@/server/model";

interface RequestBody {
  selectedText: string;
  fullContent: string;
  option: string;
  customPrompt: string;
}

export async function POST(req: Request) {
  try {
    // Get the user session and check access
    const hasAccess = await checkAccess();

    if (!hasAccess) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const { selectedText, fullContent, option, customPrompt }: RequestBody =
      await req.json();

    const msg = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `
  You are tasked with rewriting, adding content, or continuing the text based on the full content provided. Your goal is to improve and enhance the selected text, add new content, or continue the text while ensuring it fits seamlessly within the overall content.

  Here is the full content:
  <full_content>
  ${fullContent}
  </full_content>

  ${
    option !== "continue"
      ? `
  Here is the selected text to be rewritten or the insertion point for new content:
  <selected_text>
  ${selectedText}
  </selected_text>
  `
      : ""
  }

  Rewriting option: ${option}

  Please ${
    option === "continue"
      ? "continue the text"
      : "rewrite the selected text or add new content"
  } based on the given option, keeping the following in mind:
  1. Maintain the core message, key points, and tone of the full content
  2. Ensure the ${
    option === "continue" ? "continued" : "rewritten or new"
  } text fits well within the context of the full content
  3. Follow the specific instructions based on the chosen option:
     ${
       option === "continue"
         ? "- continue writing: Add a logical continuation to the full content, maintaining the current structure and tone"
         : `- simplify text: Reduce complexity while preserving meaning
     - fix grammar: Correct any grammatical errors
     - make shorter: Condense the content without losing essential information
     - make longer: Expand on the content with relevant details or examples
     - improve writing: Enhance clarity, engagement, and professionalism
     - add a hook: Write an engaging opening that captures the reader's attention. should not be more than 25 words.
     - add a cta: Write a compelling call-to-action that encourages specific action not more than 25 words.`
     }
  4. If user asks for bolded or italic text, use unicode text instead of markdown format

  Provide the ${
    option === "continue" ? "continued" : "rewritten or new"
  } text within <rewritten_text> tags. Do not include any additional comments or explanations.
`,
        },
      ],
    });

    const content = msg.content[0]?.type === "text" ? msg.content[0].text : "";

    const outputTokens = msg.usage.output_tokens;
    const estimatedWords = Math.round(outputTokens * 0.75);

    await setGeneratedWords(estimatedWords);

    const rewrittenText =
      content
        .match(/<rewritten_text>([\s\S]*?)<\/rewritten_text>/)?.[1]
        ?.trim() || "";

    return NextResponse.json({ rewrittenText }, { status: 200 });
  } catch (error) {
    console.error("Error in rewriting text:", error);
    return NextResponse.json(
      { error: "Failed to rewrite text" },
      { status: 500 }
    );
  }
}
