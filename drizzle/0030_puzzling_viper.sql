ALTER TABLE "bluecast.ai_account" ADD COLUMN "workspace_id" varchar(256);--> statement-breakpoint
ALTER TABLE "bluecast.ai_for_you_answer" ADD COLUMN "workspace_id" varchar(256);--> statement-breakpoint
ALTER TABLE "bluecast.ai_generated_post" ADD COLUMN "workspace_id" varchar(256);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_account" ADD CONSTRAINT "bluecast.ai_account_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_for_you_answer" ADD CONSTRAINT "bluecast.ai_for_you_answer_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_generated_post" ADD CONSTRAINT "bluecast.ai_generated_post_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
