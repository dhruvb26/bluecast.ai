ALTER TABLE "bluecast.ai_content_style" ADD COLUMN "workspace_id" varchar(256);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_content_style" ADD CONSTRAINT "bluecast.ai_content_style_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
