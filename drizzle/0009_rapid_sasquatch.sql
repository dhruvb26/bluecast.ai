ALTER TABLE "bluecast.ai_account" ALTER COLUMN "userId" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" ALTER COLUMN "provider" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" ALTER COLUMN "providerAccountId" SET DATA TYPE varchar(128);--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" ALTER COLUMN "token_type" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" ALTER COLUMN "scope" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" ADD COLUMN "refresh_token_expires_in" integer;--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" ADD COLUMN "expires_in" integer;--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" DROP COLUMN IF EXISTS "type";--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" DROP COLUMN IF EXISTS "expires_at";--> statement-breakpoint
ALTER TABLE "bluecast.ai_account" DROP COLUMN IF EXISTS "session_state";