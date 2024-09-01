DO $$ BEGIN
 CREATE TYPE "public"."status" AS ENUM('saved', 'scheduled', 'published');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "bluecast.ai_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_authenticator" (
	"credentialID" text NOT NULL,
	"userId" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"credentialPublicKey" text NOT NULL,
	"counter" integer NOT NULL,
	"credentialDeviceType" text NOT NULL,
	"credentialBackedUp" boolean NOT NULL,
	"transports" text,
	CONSTRAINT "bluecast.ai_authenticator_userId_credentialID_pk" PRIMARY KEY("userId","credentialID"),
	CONSTRAINT "bluecast.ai_authenticator_credentialID_unique" UNIQUE("credentialID")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_content_style" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"examples" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_creator" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"profile_url" varchar(256),
	"full_name" varchar(128),
	"profile_image_url" varchar(256),
	"headline" varchar(128)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_draft" (
	"id" varchar(512) PRIMARY KEY NOT NULL,
	"name" varchar(512),
	"status" "status",
	"user_id" varchar(512),
	"scheduled_for" timestamp with time zone,
	"linked_in_id" varchar(512),
	"content" text,
	"document_urn" varchar(512),
	"document_title" varchar(512),
	"time_zone" varchar(512),
	"download_url" varchar(512),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_idea" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256),
	"content" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_post_format" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256),
	"templates" jsonb NOT NULL,
	"category" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_post" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"creator_id" varchar(256) NOT NULL,
	"images" jsonb,
	"document" jsonb,
	"video" jsonb,
	"num_appreciations" integer DEFAULT 0,
	"num_comments" integer DEFAULT 0,
	"num_empathy" integer DEFAULT 0,
	"num_interests" integer DEFAULT 0,
	"num_likes" integer DEFAULT 0,
	"num_reposts" integer DEFAULT 0,
	"post_url" varchar(256),
	"reshared" boolean DEFAULT false,
	"text" text,
	"time" varchar(64),
	"urn" varchar(64),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_session" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp,
	"image" varchar(255),
	"hasAccess" boolean DEFAULT true,
	"price_id" varchar(255),
	"stripe_customer_id" varchar(255),
	"headline" varchar(255),
	"stripe_subscription_id" varchar(255),
	"trial_ends_at" timestamp,
	"onboarding_complete" boolean DEFAULT false,
	"generated_words" integer DEFAULT 0 NOT NULL,
	"onboarding_data" jsonb,
	"special_access" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "bluecast.ai_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_account" ADD CONSTRAINT "bluecast.ai_account_userId_bluecast.ai_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_authenticator" ADD CONSTRAINT "bluecast.ai_authenticator_userId_bluecast.ai_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_content_style" ADD CONSTRAINT "bluecast.ai_content_style_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_post_format" ADD CONSTRAINT "bluecast.ai_post_format_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_post" ADD CONSTRAINT "bluecast.ai_post_creator_id_bluecast.ai_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."bluecast.ai_creator"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_session" ADD CONSTRAINT "bluecast.ai_session_userId_bluecast.ai_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
