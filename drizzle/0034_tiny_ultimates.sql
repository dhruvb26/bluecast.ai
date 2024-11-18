ALTER TABLE "bluecast.ai_account" DROP CONSTRAINT "bluecast.ai_account_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_content_style" DROP CONSTRAINT "bluecast.ai_content_style_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_creator_list" DROP CONSTRAINT "bluecast.ai_creator_list_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_for_you_answer" DROP CONSTRAINT "bluecast.ai_for_you_answer_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_generated_post" DROP CONSTRAINT "bluecast.ai_generated_post_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_idea" DROP CONSTRAINT "bluecast.ai_idea_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_account" ADD CONSTRAINT "bluecast.ai_account_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_content_style" ADD CONSTRAINT "bluecast.ai_content_style_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_creator_list" ADD CONSTRAINT "bluecast.ai_creator_list_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_for_you_answer" ADD CONSTRAINT "bluecast.ai_for_you_answer_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_generated_post" ADD CONSTRAINT "bluecast.ai_generated_post_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_idea" ADD CONSTRAINT "bluecast.ai_idea_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
