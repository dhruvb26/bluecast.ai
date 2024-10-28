import { env } from "@/env";
import { NextResponse } from "next/server";
import {
  checkAccess,
  getForYouAnswers,
  setGeneratedWords,
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
    ${examples}
    </examples>
    Study these examples carefully to understand the tone, formatting, and styling of successful LinkedIn posts. Don't pull any information from them.
    Pay attention to recurring hooks or CTAs in the examples.
    For example: If examples don't use bullet points, don't use them.

    <formats>
    ${formats}
    </formats>
    Understand the user's preferred formats and use them to guide the content. For example, if the user wants to write interviews, write posts in that format.

    <topics>
    ${topics}
    </topics>
    These are the topics to cover in the posts. If user has given you a list of topics, use them. If not, use the topics generated as a guide to create 6 posts.
  
    <user_info>
    ${aboutYourself}
    </user_info>
    Analyze what the user's role might be on LinkedIn. Write posts from the perspective of the user's role.

    <target_audience>
    ${targetAudience}
    </target_audience>
    Consider how to cater to this audience. Write posts from the perspective of the user's role.

    <personal_touch>
    ${personalTouch}
    </personal_touch>
    This is the user's personal writing style. Incorporate it into your posts. NOTE: This takes priority over the examples.

    Write 5 full LinkedIn posts following these guidelines:

    a. Each post should be between 1200 and 1500 characters long.
    b. Start writing each post directly without including a starting idea (one-liner) or hook. The posts should not have a title or subtitle.
    c. Do not include emojis or hashtags unless specifically mentioned in the custom instructions.
    d. Emulate the tone, formatting, and styling of the analyzed examples. However, do not draw any specific information or content from these examples - they are solely for guiding the writing style.
    e. If conflicts arise in the tone, formatting, or styling prioritize the user's personal writing prefernce over the examples. For example, if the user wants to use emojis, do so or if they don't want to use bullet points, but the example uses them, do not use bullet points.

    Respond with 6 LinkedIn post contents only, separated by three dashes (---). Include appropriate new lines and spacing within each post. Do not include any explanations, comments, or additional formatting.`;

    const postResponse = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 8192,
      temperature: 0.5,
      messages: [{ role: "user", content: postPrompt }],
    });

    console.log(postResponse);

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
