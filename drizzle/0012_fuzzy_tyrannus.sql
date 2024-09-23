ALTER TABLE "bluecast.ai_content_style" DROP CONSTRAINT "bluecast.ai_content_style_user_id_bluecast.ai_user_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_creator_list" DROP CONSTRAINT "bluecast.ai_creator_list_user_id_bluecast.ai_user_id_fk";
--> statement-breakpoint
ALTER TABLE "bluecast.ai_post_format" DROP CONSTRAINT "bluecast.ai_post_format_user_id_bluecast.ai_user_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_content_style" ADD CONSTRAINT "bluecast.ai_content_style_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_creator_list" ADD CONSTRAINT "bluecast.ai_creator_list_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_draft" ADD CONSTRAINT "bluecast.ai_draft_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_idea" ADD CONSTRAINT "bluecast.ai_idea_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_post_format" ADD CONSTRAINT "bluecast.ai_post_format_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
