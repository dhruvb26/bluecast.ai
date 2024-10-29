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

    <examples>
    ${examples || ""}
    </examples>
    Study these examples carefully to understand the tone, formatting, and styling of the posts. Don't pull any information from them.
    - Mimic the tone, voice, and writing style precisely
    - Reproduce any unique patterns in content presentation
    - DO NOT use any specific information or content from these examples

    <formats>
    ${formats || ""}
    </formats>
    Understand the user's preferred formats and use them to guide the content. 
    - Use this format only if it doesn't conflict with the user's style.
    - If the number of formats is less than 5, generate respective number of posts following the format and remaining posts should be formatted according to the examples above if any. 
    - If the number of formats is more than 5, generate 5 posts following the first five formats.

    <topics>
    ${topics || ""}
    </topics>
    These are the topics to cover in the posts.
    - If user has given you a list of topics, use them. Never use them as a starting liner or hook of the post.
    - If user has not given you a list of topics, generate 5 topics based on the user's answers below.

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
    This is the user's personal writing style. Incorporate it into your posts. 
    - NOTE: This takes PRIORITY over the examples provided above.
    - Strictly follow the user's personal touch and any specific instructions provided.

    Write 5 full LinkedIn posts following these guidelines:

    a. 2 posts should be between 1200 and 1500 characters long.
    b. 2 posts should be between 500 and 1000 characters long.
    c. 1 post should be between 200 and 500 characters long.
    b. Start writing each post directly without including a starting idea (one-liner) or hook. The posts should not have a title or subtitle.
    c. Do not include emojis or hashtags unless specifically mentioned by user's personal touch.
    d. Emulate the tone, formatting, and styling of the analyzed examples. However, do not draw any specific information or content from these examples - they are solely for guiding the writing style.
    e. If conflicts arise in the tone, formatting, or styling prioritize the user's personal writing preference over the examples. For example, if the user wants to use emojis, do so or if they don't want to use bullet points, but the example uses them, do not use bullet points.

    Respond with 5 LinkedIn post contents only, separated by three dashes (---). Include appropriate new lines and spacing within each post. Do not include any explanations, comments, or additional formatting.`;

    const postResponse = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 8192,
      temperature: 0.5,
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
