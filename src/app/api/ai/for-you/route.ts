import { env } from "@/env";
import { NextResponse } from "next/server";
import {
  checkAccess,
  getForYouAnswers,
  getUser,
  saveForYouPosts,
} from "@/actions/user";
import { RouteHandlerResponse } from "@/types";
import { getContentStyle } from "@/actions/style";
import { joinExamples } from "@/utils/functions";
import { anthropic } from "@/server/model";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
export const maxDuration = 120;

export interface LinkedInPost {
  id: string;
  content: string;
}

export async function POST(
  req: Request
): Promise<NextResponse<RouteHandlerResponse<LinkedInPost[]>>> {
  try {
    const hasAccess = await checkAccess();

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, error: "Not authorized!" },
        { status: 401 }
      );
    }

    const userInfo = await getUser();

    if (
      !userInfo.stripeSubscriptionId &&
      !userInfo.stripeCustomerId &&
      userInfo.forYouGeneratedPosts >= 5
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You have reached the maximum number of refreshes. Upgrade to get more refreshes.",
        },
        { status: 403 }
      );
    }

    if (userInfo.forYouGeneratedPosts >= 20) {
      return NextResponse.json(
        {
          success: false,
          error:
            "You have reached the maximum number of refreshes. Limit resets every month.",
        },
        { status: 403 }
      );
    }

    const answers = await getForYouAnswers();

    if (!answers) {
      throw new Error("No For You answers found.");
    }

    const {
      aboutYourself,
      targetAudience,
      personalTouch,
      contentStyle,
      topics,
      formats,
    } = answers;

    const user = await getUser();
    const onboardingData = user.onboardingData;

    let examples;
    if (contentStyle) {
      const response = await getContentStyle(contentStyle);
      if (response.success) {
        examples = response.data.examples;
        examples = joinExamples(examples);
      }
    }

    const postPrompt = `You are a copywriter with 25 years of experience. You are tasked with creating 5 distinct LinkedIn posts based on the following information:

     <user_info>
    ${aboutYourself || ""}
    </user_info>
    Analyze what the user's role might be on LinkedIn. Write posts from the perspective of the user's role.

    <target_audience>
    ${targetAudience || ""}
    </target_audience>
    Consider how to cater to this audience. Write posts from the perspective of the user's role.

    <personal_touch>
    ${personalTouch || ""}
    </personal_touch>
    This is the user's personal writing style. Strictly incorporate this into your posts.
    - Follow the user's personal touch and any specific instructions provided. 
    - For example: if the user wants to use emojis, do so or if they don't want to use bullet points, but the example uses them, do not use bullet points. If user says he writes in a very casual tone, do not write posts in a very formal tone.

    <examples>
    ${examples || ""}
    </examples>
    This is what you should use as context to understand the tone, formatting, and styling of the posts. Don't pull any information from them.
    - Mimic the tone, voice, and writing style precisely. Pay attention to formatting, punctuation, and other stylistic elements. 
    NOTE: This DOES NOT take priority over the user's personal touch.
    - DO NOT use any specific information or content from these examples

    <formats>
    ${formats || ""}
    </formats>
    Understand the user's preferred formats and use them to guide the content. 
    - If the number of formats is less than 5, generate respective number of posts following the format and remaining posts should be formatted according to the given examples if there are any. 
    - If the number of formats is more than 5, generate 5 posts following the first five formats.
    - For examples the formats could be: Hot take, Story, Question, Quote, Interview, Takeaways, Things to know, Things to do, etc.

    <topics>
    ${topics || ""}
    </topics>
    These are the topics to cover in the posts. Carefully consider them.
    - NEVER use them as a starting liner or hook of the post.
    - Incorporate them into the posts in a natural way. 
    - For example: if the user says he wants to write about "AI in marketing", don't start the post with "AI in marketing". Instead write a post about AI in marketing in a natural way.

    Write 5 LinkedIn posts following these guidelines:

    1. 1 post should be above 1200 characters long.
    2. 2 posts should be between 500 and 1000 characters long.
    3. 2 posts should be less than 400 characters long.
    4. Make sure to abide by the character limits STRICTLY for each post.
    5. NEVER start a post starting with a one-liner, a single line idea or a hook that's a single line. The posts should NOT have a title or subtitle either.
    6. Make sure to follow the user given formats accordingly. 
    7. Do not include emojis or hashtags unless specifically mentioned by user's personal touch.
    8. Emulate the tone, formatting, and styling of the analyzed examples. However, do not draw any specific information or content from these examples - they are solely for guiding the writing style.
    9. If conflicts arise in the tone, formatting, or styling prioritize the user's personal writing preference over the examples. For example, if the user wants to use emojis, do so or if they don't want to use bullet points, but the example uses them, do not use bullet points.

    Respond with 5 LinkedIn post contents only, separated by three dashes (---). Include appropriate new lines and spacing within each post. Do not include any explanations, comments, or additional formatting.`;

    const postResponse = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 8192,
      temperature: 0.8,
      messages: [{ role: "user", content: postPrompt }],
    });

    const postResult = postResponse.content[0] as any;

    let postContents: string[] = [];

    if ("text" in postResult) {
      postContents = postResult.text
        .split("---")
        .map((post: any) => post.trim());
    }

    const posts: LinkedInPost[] = postContents.map((content) => ({
      id: uuidv4(),
      content,
    }));

    await saveForYouPosts(posts);

    const userId = userInfo.id;
    await db
      .update(users)
      .set({ forYouGeneratedPosts: sql`${users.forYouGeneratedPosts} + 5` })
      .where(eq(users.id, userId));

    return NextResponse.json({ success: true, data: posts }, { status: 200 });
  } catch (error) {
    console.error("Error generating for you posts:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate for you posts." },
      { status: 500 }
    );
  }
}
