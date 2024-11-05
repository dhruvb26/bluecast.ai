"use server";

import { db } from "@/server/db";
import { postFormats } from "@/server/db/schema";
import { getUser } from "./user";
import { eq, and, isNull, or } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { ServerActionResponse } from "@/types";

// Define the PostFormat type
export type PostFormat = {
  id: string;
  userId: string | null;
  templates: string[];
  category: string;
  createdAt: Date;
  updatedAt: Date;
};

export async function savePostFormat(
  template: string,
  category: string,
  isPublic: boolean
): Promise<ServerActionResponse<PostFormat>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const id = uuid();

    // Fetch existing templates for the user and category
    const existingFormat = await db
      .select()
      .from(postFormats)
      .where(
        and(
          or(eq(postFormats.userId, userId), isNull(postFormats.userId)),
          eq(postFormats.category, category)
        )
      )
      .execute()
      .then((results) => results[0] || null);

    let newPostFormat;
    if (existingFormat) {
      // If format exists, prepend the new template
      newPostFormat = await db
        .update(postFormats)
        .set({
          templates: [template, ...existingFormat.templates],
          updatedAt: new Date(),
        })
        .where(eq(postFormats.id, existingFormat.id))
        .returning();
    } else {
      // If no existing format, create a new one
      newPostFormat = await db
        .insert(postFormats)
        .values({
          id,
          userId: null,
          templates: [template],
          category,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    return {
      success: true,
      data: newPostFormat[0] as PostFormat,
    };
  } catch (error) {
    console.error("Error saving post format:", error);
    return {
      success: false,
      error: "Failed to save post format",
    };
  }
}

export async function getPostFormats(
  isPublic: boolean
): Promise<ServerActionResponse<PostFormat[]>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    let userPostFormats;
    if (isPublic) {
      userPostFormats = await db
        .select()
        .from(postFormats)
        .where(isNull(postFormats.userId));
    } else {
      userPostFormats = await db
        .select()
        .from(postFormats)
        .where(eq(postFormats.userId, userId));
    }

    return {
      success: true,
      data: userPostFormats as PostFormat[],
    };
  } catch (error) {
    console.error("Error fetching post formats:", error);
    return {
      success: false,
      error: "Failed to fetch post formats",
    };
  }
}

export async function getPostFormat(
  formatId: string
): Promise<ServerActionResponse<PostFormat>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const postFormat = await db
      .select()
      .from(postFormats)
      .where(eq(postFormats.id, formatId))
      .limit(1);

    if (postFormat.length === 0) {
      return {
        success: false,
        error: "Post format not found",
      };
    }

    return {
      success: true,
      data: postFormat[0] as PostFormat,
    };
  } catch (error) {
    console.error("Error fetching post format:", error);
    return {
      success: false,
      error: "Failed to fetch post format",
    };
  }
}

export async function deletePostFormat(
  formatId: string
): Promise<ServerActionResponse<void>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const deletedPostFormat = await db
      .delete(postFormats)
      .where(eq(postFormats.id, formatId))
      .returning();

    if (deletedPostFormat.length === 0) {
      return {
        success: false,
        error: "Post format not found or already deleted",
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error("Error deleting post format:", error);
    return {
      success: false,
      error: "Failed to delete post format",
    };
  }
}

export async function updatePostFormatTemplate(
  formatId: string,
  oldTemplate: string,
  newTemplate: string
): Promise<ServerActionResponse<PostFormat>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const existingFormat = await db
      .select()
      .from(postFormats)
      .where(eq(postFormats.id, formatId))
      .execute()
      .then((results) => results[0] || null);

    if (!existingFormat) {
      return {
        success: false,
        error: "Post format not found",
      };
    }

    const templateIndex = existingFormat.templates.findIndex(
      (template) => template === oldTemplate
    );

    if (templateIndex === -1) {
      return {
        success: false,
        error: "Template not found in the specified category",
      };
    }

    const updatedTemplates = [...existingFormat.templates];
    updatedTemplates[templateIndex] = newTemplate;

    const updatedFormat = await db
      .update(postFormats)
      .set({
        templates: updatedTemplates,
        updatedAt: new Date(),
      })
      .where(eq(postFormats.id, formatId))
      .returning();

    return {
      success: true,
      data: updatedFormat[0] as PostFormat,
    };
  } catch (error) {
    console.error("Error editing post format template:", error);
    return {
      success: false,
      error: "Failed to edit post format template",
    };
  }
}

export async function addPostFormatTemplate(
  formatId: string,
  newTemplate: string
): Promise<ServerActionResponse<PostFormat>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const existingFormat = await db
      .select()
      .from(postFormats)
      .where(eq(postFormats.id, formatId))
      .execute()
      .then((results) => results[0] || null);

    if (!existingFormat) {
      return {
        success: false,
        error: "Post format not found",
      };
    }

    const updatedTemplates = [...existingFormat.templates, newTemplate];

    const updatedFormat = await db
      .update(postFormats)
      .set({
        templates: updatedTemplates,
        updatedAt: new Date(),
      })
      .where(eq(postFormats.id, formatId))
      .returning();

    return {
      success: true,
      data: updatedFormat[0] as PostFormat,
    };
  } catch (error) {
    console.error("Error adding post format template:", error);
    return {
      success: false,
      error: "Failed to add post format template",
    };
  }
}

export async function deletePostFormatTemplate(
  formatId: string,
  templateToDelete: string
): Promise<ServerActionResponse<PostFormat>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const existingFormat = await db
      .select()
      .from(postFormats)
      .where(eq(postFormats.id, formatId))
      .execute()
      .then((results) => results[0] || null);

    if (!existingFormat) {
      return {
        success: false,
        error: "Post format not found",
      };
    }

    const updatedTemplates = existingFormat.templates.filter(
      (template) => template !== templateToDelete
    );

    const updatedFormat = await db
      .update(postFormats)
      .set({
        templates: updatedTemplates,
        updatedAt: new Date(),
      })
      .where(eq(postFormats.id, formatId))
      .returning();

    return {
      success: true,
      data: updatedFormat[0] as PostFormat,
    };
  } catch (error) {
    console.error("Error deleting post format template:", error);
    return {
      success: false,
      error: "Failed to delete post format template",
    };
  }
}

export async function updatePostFormatCategory(
  formatId: string,
  newCategory: string
): Promise<ServerActionResponse<PostFormat>> {
  try {
    const user = await getUser();
    const userId = user.id;

    if (!userId) {
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const updatedFormat = await db
      .update(postFormats)
      .set({
        category: newCategory,
        updatedAt: new Date(),
      })
      .where(eq(postFormats.id, formatId))
      .returning();

    if (updatedFormat.length === 0) {
      return {
        success: false,
        error: "Post format not found",
      };
    }

    return {
      success: true,
      data: updatedFormat[0] as PostFormat,
    };
  } catch (error) {
    console.error("Error updating post format category:", error);
    return {
      success: false,
      error: "Failed to update post format category",
    };
  }
}
