import { sql, relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTableCreator,
  timestamp,
  primaryKey,
  varchar,
  pgEnum,
  text,
  jsonb,
  bigint,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `bluecast.ai_${name}`);

export const statusEnum = pgEnum("status", [
  "saved",
  "scheduled",
  "published",
  "progress",
]);

export const workspaces = createTable("workspace", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  linkedInName: varchar("linked_in_name", { length: 256 }),
  linkedInImageUrl: varchar("linked_in_image_url", { length: 512 }),
  linkedInHeadline: varchar("linked_in_headline", { length: 512 }),
  usage: integer("usage").default(0).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  hasAccess: boolean("has_access").default(true),
});

// Content
export const drafts = createTable("draft", {
  id: varchar("id", { length: 512 }).primaryKey().notNull(),
  name: varchar("name", { length: 512 }),
  status: statusEnum("status").notNull(),
  userId: varchar("user_id", { length: 512 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  scheduledFor: timestamp("scheduled_for", { withTimezone: true }),
  content: text("content"),
  documentUrn: varchar("document_urn", { length: 512 }),
  documentTitle: varchar("document_title", { length: 512 }),
  timeZone: varchar("time_zone", { length: 512 }),
  downloadUrl: varchar("download_url", { length: 512 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id,
    { onDelete: "cascade" }
  ),
});

export const ideas = createTable("idea", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  content: text("content"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id,
    { onDelete: "cascade" }
  ),
});

export const contentStyles = createTable("content_style", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  creatorId: varchar("creator_id", { length: 256 }).references(
    () => creators.id
  ),
  name: varchar("name", { length: 256 }).notNull(),
  examples: jsonb("examples").notNull().$type<string[]>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id,
    { onDelete: "cascade" }
  ),
});

export const postFormats = createTable("post_format", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  templates: jsonb("templates").notNull().$type<string[]>(),
  category: varchar("category", { length: 256 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
});

export const postFormatRelations = relations(postFormats, ({ one }) => ({
  user: one(users, { fields: [postFormats.userId], references: [users.id] }),
}));

export const contentStyleRelations = relations(contentStyles, ({ one }) => ({
  user: one(users, { fields: [contentStyles.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [contentStyles.workspaceId],
    references: [workspaces.id],
  }),
}));

// Inspiration
export const creators = createTable(
  "creator",
  {
    id: varchar("id", { length: 256 }).primaryKey().notNull(),
    profileUrl: varchar("profile_url", { length: 512 }),
    fullName: varchar("full_name", { length: 256 }),
    profileImageUrl: varchar("profile_image_url", { length: 512 }),
    headline: varchar("headline", { length: 512 }),
    urn: varchar("urn", { length: 256 }),
  },
  (table) => {
    return {
      dropCascade: true,
    };
  }
);

export const posts = createTable("post", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  creatorId: varchar("creator_id", { length: 256 })
    .notNull()
    .references(() => creators.id),
  images: jsonb("images").$type<string[] | null>(),
  document: jsonb("document").$type<Record<string, any> | null>(),
  video: jsonb("video").$type<Record<string, any> | null>(),
  numAppreciations: integer("num_appreciations").default(0),
  numComments: integer("num_comments").default(0),
  numEmpathy: integer("num_empathy").default(0),
  numInterests: integer("num_interests").default(0),
  numLikes: integer("num_likes").default(0),
  numReposts: integer("num_reposts").default(0),
  postUrl: varchar("post_url", { length: 256 }),
  reshared: boolean("reshared").default(false),
  text: text("text"),
  time: varchar("time", { length: 64 }),
  urn: varchar("urn", { length: 64 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
});

export const creatorRelations = relations(creators, ({ many }) => ({
  posts: many(posts),
}));

export const postRelations = relations(posts, ({ one }) => ({
  creator: one(creators, {
    fields: [posts.creatorId],
    references: [creators.id],
  }),
}));

export const instructions = createTable("instruction", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  instructions: text("instructions").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id
  ),
});

export const instructionRelations = relations(instructions, ({ one }) => ({
  user: one(users, { fields: [instructions.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [instructions.workspaceId],
    references: [workspaces.id],
  }),
}));

// Users & Accounts
export const users = createTable("user", {
  id: varchar("id", { length: 255 }).primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  linkedInId: varchar("linkedin_id", { length: 128 }),
  image: varchar("image", { length: 255 }),
  hasAccess: boolean("hasAccess").default(true),
  priceId: varchar("price_id", { length: 255 }),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }),
  headline: varchar("headline", { length: 255 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  trialEndsAt: timestamp("trial_ends_at"),
  onboardingComplete: boolean("onboarding_complete").default(false),
  forYouGeneratedPosts: integer("for_you_generated_posts").default(0).notNull(),
  generatedWords: integer("generated_words").default(0).notNull(),
  generatedPosts: integer("generated_posts").default(0).notNull(),
  onboardingData: jsonb("onboarding_data"),
  specialAccess: boolean("special_access").default(true),
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  contentStyles: many(contentStyles),
  postFormats: many(postFormats),
  drafts: many(drafts),
  workspaces: many(workspaces),
  forYouAnswers: many(forYouAnswers),
  generatedPosts: many(generatedPosts),
  instructions: many(instructions),
}));

export const accounts = createTable(
  "account",
  {
    userId: varchar("userId", { length: 256 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 128 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 128 }).notNull(),
    refresh_token: text("refresh_token"),
    refresh_token_expires_in: integer("refresh_token_expires_in"),
    access_token: text("access_token"),
    expires_at: bigint("expires_at", { mode: "number" }),
    expires_in: integer("expires_in"),
    token_type: varchar("token_type", { length: 256 }),
    scope: varchar("scope", { length: 256 }),
    id_token: text("id_token"),
    workspaceId: varchar("workspace_id", { length: 256 }).references(
      () => workspaces.id,
      { onDelete: "cascade" }
    ),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [accounts.workspaceId],
    references: [workspaces.id],
  }),
}));

export const creatorLists = createTable("creator_list", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  userId: varchar("user_id", { length: 256 }).references(() => users.id, {
    onDelete: "cascade",
  }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id,
    { onDelete: "cascade" }
  ),
});

export const creatorListItems = createTable("creator_list_item", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  creatorListId: varchar("creator_list_id", { length: 256 })
    .notNull()
    .references(() => creatorLists.id, { onDelete: "cascade" }),
  creatorId: varchar("creator_id", { length: 256 })
    .notNull()
    .references(() => creators.id),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

export const creatorListsRelations = relations(
  creatorLists,
  ({ one, many }) => ({
    user: one(users, { fields: [creatorLists.userId], references: [users.id] }),
    items: many(creatorListItems),
    workspace: one(workspaces, {
      fields: [creatorLists.workspaceId],
      references: [workspaces.id],
    }),
  })
);

export const creatorListItemsRelations = relations(
  creatorListItems,
  ({ one }) => ({
    list: one(creatorLists, {
      fields: [creatorListItems.creatorListId],
      references: [creatorLists.id],
    }),
    creator: one(creators, {
      fields: [creatorListItems.creatorId],
      references: [creators.id],
    }),
  })
);

export const forYouAnswers = createTable("for_you_answer", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  aboutYourself: text("about_yourself").notNull(),
  targetAudience: text("target_audience").notNull(),
  formats: jsonb("formats").$type<string[]>().notNull(),
  personalTouch: text("personal_touch").notNull(),
  contentStyle: varchar("content_style", { length: 256 }),
  topics: jsonb("topics").$type<string[]>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    precision: 3,
  }).$onUpdate(() => new Date()),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id,
    { onDelete: "cascade" }
  ),
});

export const forYouAnswersRelations = relations(forYouAnswers, ({ one }) => ({
  user: one(users, { fields: [forYouAnswers.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [forYouAnswers.workspaceId],
    references: [workspaces.id],
  }),
}));

export const generatedPosts = createTable("generated_post", {
  id: varchar("id", { length: 256 }).primaryKey().notNull(),
  userId: varchar("user_id", { length: 256 })
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  topic: text("topic"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  workspaceId: varchar("workspace_id", { length: 256 }).references(
    () => workspaces.id,
    { onDelete: "cascade" }
  ),
});

export const generatedPostsRelations = relations(generatedPosts, ({ one }) => ({
  user: one(users, { fields: [generatedPosts.userId], references: [users.id] }),
  workspace: one(workspaces, {
    fields: [generatedPosts.workspaceId],
    references: [workspaces.id],
  }),
}));

// Auth schemas
export const sessions = createTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = createTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = createTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);
