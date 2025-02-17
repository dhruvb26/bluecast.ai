import { NextResponse } from "next/server";
import { accounts, drafts, users } from "@/server/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { updateDraftField } from "@/actions/draft";
import { linkedinPost } from "@/trigger/linkedin-post";

type Node = {
  type: string;
  children?: Node[];
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

const characterMaps = {
  bold: new Map([
    ["A", "𝗔"],
    ["B", "𝗕"],
    ["C", "𝗖"],
    ["D", "𝗗"],
    ["E", "𝗘"],
    ["F", "𝗙"],
    ["G", "𝗚"],
    ["H", "𝗛"],
    ["I", "𝗜"],
    ["J", "𝗝"],
    ["K", "𝗞"],
    ["L", "𝗟"],
    ["M", "𝗠"],
    ["N", "𝗡"],
    ["O", "𝗢"],
    ["P", "𝗣"],
    ["Q", "𝗤"],
    ["R", "𝗥"],
    ["S", "𝗦"],
    ["T", "𝗧"],
    ["U", "𝗨"],
    ["V", "𝗩"],
    ["W", "𝗪"],
    ["X", "𝗫"],
    ["Y", "𝗬"],
    ["Z", "𝗭"],
    ["a", "𝗮"],
    ["b", "𝗯"],
    ["c", "𝗰"],
    ["d", "𝗱"],
    ["e", "𝗲"],
    ["f", "𝗳"],
    ["g", "𝗴"],
    ["h", "𝗵"],
    ["i", "𝗶"],
    ["j", "𝗷"],
    ["k", "𝗸"],
    ["l", "𝗹"],
    ["m", "𝗺"],
    ["n", "𝗻"],
    ["o", "𝗼"],
    ["p", "𝗽"],
    ["q", "𝗾"],
    ["r", "𝗿"],
    ["s", "𝘀"],
    ["t", "𝘁"],
    ["u", "𝘂"],
    ["v", "𝘃"],
    ["w", "𝘄"],
    ["x", "𝘅"],
    ["y", "𝘆"],
    ["z", "𝘇"],
  ]),
  italic: new Map([
    ["A", "𝘈"],
    ["B", "𝘉"],
    ["C", "𝘊"],
    ["D", "𝘋"],
    ["E", "𝘌"],
    ["F", "𝘍"],
    ["G", "𝘎"],
    ["H", "𝘏"],
    ["I", "𝘐"],
    ["J", "𝘑"],
    ["K", "𝘒"],
    ["L", "𝘓"],
    ["M", "𝘔"],
    ["N", "𝘕"],
    ["O", "𝘖"],
    ["P", "𝘗"],
    ["Q", "𝘘"],
    ["R", "𝘙"],
    ["S", "𝘚"],
    ["T", "𝘛"],
    ["U", "𝘜"],
    ["V", "𝘝"],
    ["W", "𝘞"],
    ["X", "𝘟"],
    ["Y", "𝘠"],
    ["Z", "𝘡"],
    ["a", "𝘢"],
    ["b", "𝘣"],
    ["c", "𝘤"],
    ["d", "𝘥"],
    ["e", "𝘦"],
    ["f", "𝘧"],
    ["g", "𝘨"],
    ["h", "𝘩"],
    ["i", "𝘪"],
    ["j", "𝘫"],
    ["k", "𝘬"],
    ["l", "𝘭"],
    ["m", "𝘮"],
    ["n", "𝘯"],
    ["o", "𝘰"],
    ["p", "𝘱"],
    ["q", "𝘲"],
    ["r", "𝘳"],
    ["s", "𝘴"],
    ["t", "𝘵"],
    ["u", "𝘶"],
    ["v", "𝘷"],
    ["w", "𝘸"],
    ["x", "𝘹"],
    ["y", "𝘺"],
    ["z", "𝘻"],
  ]),
  boldItalic: new Map([
    ["A", "𝘼"],
    ["B", "𝘽"],
    ["C", "𝘾"],
    ["D", "𝘿"],
    ["E", "𝙀"],
    ["F", "𝙁"],
    ["G", "𝙂"],
    ["H", "𝙃"],
    ["I", "𝙄"],
    ["J", "𝙅"],
    ["K", "𝙆"],
    ["L", "𝙇"],
    ["M", "𝙈"],
    ["N", "𝙉"],
    ["O", "𝙊"],
    ["P", "𝙋"],
    ["Q", "𝙌"],
    ["R", "𝙍"],
    ["S", "𝙎"],
    ["T", "𝙏"],
    ["U", "𝙐"],
    ["V", "𝙑"],
    ["W", "𝙒"],
    ["X", "𝙓"],
    ["Y", "𝙔"],
    ["Z", "𝙕"],
    ["a", "𝙖"],
    ["b", "𝙗"],
    ["c", "𝙘"],
    ["d", "𝙙"],
    ["e", "𝙚"],
    ["f", "𝙛"],
    ["g", "𝙜"],
    ["h", "𝙝"],
    ["i", "𝙞"],
    ["j", "𝙟"],
    ["k", "𝙠"],
    ["l", "𝙡"],
    ["m", "𝙢"],
    ["n", "𝙣"],
    ["o", "𝙤"],
    ["p", "𝙥"],
    ["q", "𝙦"],
    ["r", "𝙧"],
    ["s", "𝙨"],
    ["t", "𝙩"],
    ["u", "𝙪"],
    ["v", "𝙫"],
    ["w", "𝙬"],
    ["x", "𝙭"],
    ["y", "𝙮"],
    ["z", "𝙯"],
  ]),
  underline: new Map([
    ["A", "𝙰̲"],
    ["B", "𝙱̲"],
    ["C", "𝙲̲"],
    ["D", "𝙳̲"],
    ["E", "𝙴̲"],
    ["F", "𝙵̲"],
    ["G", "𝙶̲"],
    ["H", "𝙷̲"],
    ["I", "𝙸̲"],
    ["J", "𝙹̲"],
    ["K", "𝙺̲"],
    ["L", "𝙻̲"],
    ["M", "𝙼̲"],
    ["N", "𝙽̲"],
    ["O", "𝙾̲"],
    ["P", "𝙿̲"],
    ["Q", "𝚀̲"],
    ["R", "𝚁̲"],
    ["S", "𝚂̲"],
    ["T", "𝚃̲"],
    ["U", "𝚄̲"],
    ["V", "𝚅̲"],
    ["W", "𝚆̲"],
    ["X", "𝚇̲"],
    ["Y", "𝚈̲"],
    ["Z", "𝚉̲"],
    ["a", "𝚊̲"],
    ["b", "𝚋̲"],
    ["c", "𝚌̲"],
    ["d", "𝚍̲"],
    ["e", "𝚎̲"],
    ["f", "𝚏̲"],
    ["g", "𝚐̲"],
    ["h", "𝚑̲"],
    ["i", "𝚒̲"],
    ["j", "𝚓̲"],
    ["k", "𝚔̲"],
    ["l", "𝚕̲"],
    ["m", "𝚖̲"],
    ["n", "𝚗̲"],
    ["o", "𝚘̲"],
    ["p", "𝚙̲"],
    ["q", "𝚚̲"],
    ["r", "𝚛̲"],
    ["s", "𝚜̲"],
    ["t", "𝚝̲"],
    ["u", "𝚞̲"],
    ["v", "𝚟̲"],
    ["w", "𝚠̲"],
    ["x", "𝚡̲"],
    ["y", "𝚢̲"],
    ["z", "𝚣̲"],
  ]),
};

function extractText(content: Node | Node[]): string {
  const nodes = Array.isArray(content) ? content : [content];
  let result = "";

  nodes.forEach((node, index) => {
    if (node.type === "paragraph") {
      const paragraphText = extractText(node.children || []);
      if (paragraphText.trim() === "") {
        result += "\n";
      } else {
        if (index > 0) {
          result += "\n";
        }
        result += paragraphText;
      }
    } else {
      let text = node.text || "";

      // Apply formatting
      if (node.bold || node.italic || node.underline) {
        text = text
          .split("")
          .map((char) => {
            if (/[a-zA-Z0-9]/.test(char)) {
              if (node.bold && node.italic) {
                return characterMaps.boldItalic.get(char) || char;
              } else if (node.bold) {
                return characterMaps.bold.get(char) || char;
              } else if (node.italic) {
                return characterMaps.italic.get(char) || char;
              } else if (node.underline) {
                return (characterMaps.underline.get(char) || char) + "\u0332";
              }
            }
            return char;
          })
          .join("");
      }

      result += text;
    }
  });

  return result.trim();
}
export async function POST(request: Request) {
  try {
    const { postId, userId, workspaceId } = (await request.json()) as any;

    const conditions = [eq(drafts.id, postId), eq(drafts.userId, userId)];
    if (workspaceId) {
      conditions.push(eq(drafts.workspaceId, workspaceId));
    }

    const draft = await db
      .select()
      .from(drafts)
      .where(and(...conditions))
      .limit(1);

    if (draft.length === 0) {
      return NextResponse.json(
        { error: "No draft found with the given ID and user ID." },
        { status: 400 }
      );
    }

    // Check if documentUrn is null and downloadUrl starts with https://utfs.io/f/
    if (
      !draft[0].documentUrn &&
      draft[0].downloadUrl?.startsWith("https://utfs.io/f/")
    ) {
      console.log("Triggering LinkedIn post task");

      await updateDraftField(postId, "status", "progress");

      console.log("Triggering LinkedIn post task");
      // Trigger the LinkedIn post task
      const taskPayload = {
        userId,
        postId,
        workspaceId,
        url: draft[0].downloadUrl,
      };

      await linkedinPost.trigger(taskPayload);

      return NextResponse.json({ status: "progress" });
    }

    // If no video upload is needed, continue with normal posting process
    const content = draft[0].content;
    const documentUrn = draft[0].documentUrn;
    const documentTitle = draft[0].documentTitle || "";

    let formattedContent;
    try {
      formattedContent = extractText(JSON.parse(content || "[]"));
      formattedContent = formattedContent
        .replace(/\(/g, "\uFF08")
        .replace(/\)/g, "\uFF09");
    } catch (parseError) {
      console.error("Error parsing content:", parseError);
      return NextResponse.json(
        { error: "Invalid content format" },
        { status: 400 }
      );
    }

    // Get account based on userId and workspaceId
    const accountConditions = [eq(accounts.userId, userId)];
    if (workspaceId) {
      accountConditions.push(eq(accounts.workspaceId, workspaceId));
    } else {
      accountConditions.push(isNull(accounts.workspaceId));
    }

    const accountResult = await db
      .select()
      .from(accounts)
      .where(and(...accountConditions))
      .limit(1);

    if (!accountResult || accountResult.length === 0) {
      return NextResponse.json(
        { error: "No LinkedIn account found" },
        { status: 400 }
      );
    }

    const accessToken = accountResult[0].access_token;
    const linkedInId = accountResult[0].providerAccountId;

    if (!linkedInId || !accessToken) {
      console.error("Unable to retrieve LinkedIn credentials");
      return NextResponse.json(
        { error: "Unable to retrieve LinkedIn credentials" },
        { status: 400 }
      );
    }

    let mediaContent = null;

    if (documentUrn) {
      const parts = documentUrn.split(":");
      const urnId = parts[parts.length - 1];

      if (documentUrn.includes(":image:")) {
        mediaContent = {
          media: {
            id: `urn:li:image:${urnId}`,
          },
        };
      } else if (documentUrn.includes(":document:")) {
        mediaContent = {
          media: {
            id: `urn:li:document:${urnId}`,
            title: documentTitle,
          },
        };
      } else if (documentUrn.includes(":video:")) {
        mediaContent = {
          media: {
            title: documentTitle,
            id: `urn:li:video:${urnId}`,
          },
        };
      }
    }

    const postBody: any = {
      author: `urn:li:person:${linkedInId}`,
      commentary: formattedContent,
      visibility: "PUBLIC",
      distribution: {
        feedDistribution: "MAIN_FEED",
        targetEntities: [],
        thirdPartyDistributionChannels: [],
      },
      lifecycleState: "PUBLISHED",
      isReshareDisabledByAuthor: false,
    };

    if (mediaContent) {
      postBody.content = mediaContent;
    }

    console.log("Posting to LinkedIn:", JSON.stringify(postBody, null, 2));

    const linkedInResponse = await fetch(
      "https://api.linkedin.com/rest/posts",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "LinkedIn-Version": "202501",
          Authorization: `Bearer ${accessToken}`,
          "X-Restli-Protocol-Version": "2.0.0",
        },
        body: JSON.stringify(postBody),
      }
    );

    let linkedInPostId;
    let responseData;

    if (linkedInResponse.status === 201) {
      linkedInPostId = linkedInResponse.headers.get("x-restli-id");
      console.log("LinkedIn Post ID:", linkedInPostId);
    } else {
      try {
        responseData = await linkedInResponse.json();
        console.log(
          "LinkedIn API response:",
          JSON.stringify(responseData, null, 2)
        );
      } catch (error) {
        console.error("Error reading LinkedIn API response:", error);
      }
    }

    if (!linkedInResponse.ok) {
      console.error(
        "Error publishing draft",
        linkedInResponse.status,
        responseData
      );
      return NextResponse.json(
        { error: `Error publishing draft: ${JSON.stringify(responseData)}` },
        { status: linkedInResponse.status }
      );
    }

    await db
      .update(drafts)
      .set({
        status: "published",
        updatedAt: new Date(),
      })
      .where(and(eq(drafts.id, draft[0].id), eq(drafts.userId, userId)));

    console.log("Draft published successfully");
    return NextResponse.json({
      message: "Draft published successfully",
      urn: linkedInPostId,
    });
  } catch (error) {
    console.error("Failed to post:", error);
    return NextResponse.json({ error: "Failed to post" }, { status: 500 });
  }
}
