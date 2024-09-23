DROP TABLE "bluecast.ai_content_style";--> statement-breakpoint
ALTER TABLE "bluecast.ai_draft" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "bluecast.ai_draft" ALTER COLUMN "user_id" SET NOT NULL;