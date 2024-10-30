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
import { generatedPosts, users } from "@/server/db/schema";
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

    // if (
    //   !userInfo.stripeSubscriptionId &&
    //   !userInfo.stripeCustomerId &&
    //   userInfo.forYouGeneratedPosts >= 5
    // ) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error:
    //         "You have reached the maximum number of refreshes. Upgrade to get more refreshes.",
    //     },
    //     { status: 403 }
    //   );
    // }

    // if (userInfo.forYouGeneratedPosts >= 20) {
    //   return NextResponse.json(
    //     {
    //       success: false,
    //       error:
    //         "You have reached the maximum number of refreshes. Limit resets every month.",
    //     },
    //     { status: 403 }
    //   );
    // }
    const previousPosts = await db.query.generatedPosts.findMany({
      where: eq(generatedPosts.userId, userInfo.id),
    });
    const previousTopics = previousPosts?.map((post) => post.topic) || [];

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

    const previousTopicsContext =
      previousTopics.length > 0
        ? `
    <previous_topics>
    ${previousTopics.join("\n")}
    </previous_topics>
    
    Please generate topics that are sufficiently different from these previous topics.`
        : "";

    const topicsPrompt = `Generate 5 distinct topics/ideas for LinkedIn posts based on the following information:

    <user_background>
    ${aboutYourself || ""}
    </user_background>
    
    <target_audience>
    ${targetAudience || ""}
    </target_audience>

    <topics_of_interest>
    ${topics || ""}
    </topics_of_interest>
    ${previousTopicsContext}

    Instructions:
    1. Generate 5 specific topics that align with the user's background and target audience
    2. Each topic should be detailed enough to write a full LinkedIn post about
    3. Focus on topics that would drive engagement and provide value to the target audience
    4. Topics should be specific and actionable, not broad or generic
    5. Do not write the actual post content, just the topic/idea
    6. Make sure to generate 5 unique topics that are different from the previous topics

    Format your response as 5 topics/ideas separated by three dashes (---), with no additional explanations or formatting.`;

    const topicsResponse = await anthropic.messages.create({
      model: env.MODEL,
      max_tokens: 1000,
      temperature: 1,
      messages: [{ role: "user", content: topicsPrompt }],
    });

    const topicsResult = topicsResponse.content[0] as any;
    let generatedTopics: string[] = [];

    if ("text" in topicsResult) {
      generatedTopics = topicsResult.text
        .split("---")
        .map((topic: string) => topic.trim());
    }

    console.log("generatedTopics", generatedTopics);

    const postPrompt = `Write 5 distinct LinkedIn posts based on the following topics and style guidelines:

    <topics_to_cover>
    ${generatedTopics.join("\n")}
    </topics_to_cover>
    
    <personal_touch>
    ${personalTouch || ""}
    </personal_touch>
    This is the user's personal writing style. Strictly incorporate this into your posts.
    - Follow the user's personal touch and any specific instructions provided.
    - For example: if the user wants to use emojis, do so or if they don't want to use bullet points, but the example uses them, do not use bullet points.

    <preferred_formats>
    ${formats || ""}
    </preferred_formats>
    Adapt the posts to these preferred content formats (e.g. stories, hot takes, questions, quotes, interviews, takeaways, etc.)

    <examples>
    ${examples || ""}
    </examples>
    Use these examples to understand the tone, formatting, and styling. Don't pull any information from them.
    - Identify and replicate the exact structure, formatting, and stylistic elements
    - Mimic the tone, voice, and writing style precisely
    - Reproduce any unique patterns in content presentation
    - DO NOT use any specific information or content from these examples

    Guidelines for the 5 posts:
    1. 2 post should be above 1200 characters
    2. 2 posts should be between 500-1000 characters
    3. 1 post should be less than 400 characters. For this particular post, have line breaks after one or two sentences.
    4. STRICTLY follow character limits
    5. Incorporate in the format guidelines as much as possible without compromising on the content.
    6. No one-liners, hooks, titles or subtitles at the start
    7. No emojis/hashtags unless specified in personal touch
    8. Prioritize user's writing preferences over examples if conflicts arise

    Respond with 5 LinkedIn post contents only, separated by three dashes (---). Include appropriate new lines and spacing within each post.`;

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

    const posts: LinkedInPost[] = postContents.map((content, index) => ({
      id: uuidv4(),
      content,
      topic: generatedTopics[index],
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
