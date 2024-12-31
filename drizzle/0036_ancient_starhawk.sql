ALTER TABLE "bluecast.ai_instruction" DROP CONSTRAINT "bluecast.ai_instruction_workspace_id_bluecast.ai_workspace_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_instruction" ADD CONSTRAINT "bluecast.ai_instruction_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
