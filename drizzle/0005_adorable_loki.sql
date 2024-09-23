ALTER TABLE "bluecast.ai_content_style" ADD COLUMN "creator_id" varchar(256);--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_content_style" ADD CONSTRAINT "bluecast.ai_content_style_creator_id_bluecast.ai_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."bluecast.ai_creator"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
