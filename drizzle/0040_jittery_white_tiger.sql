CREATE TABLE IF NOT EXISTS "bluecast.ai_temp_table" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(256) NOT NULL,
	"inviter_user_id" varchar(256),
	"workspace_id" varchar(256),
	"role" "workspace_role" DEFAULT 'org:member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_temp_table" ADD CONSTRAINT "bluecast.ai_temp_table_inviter_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("inviter_user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_temp_table" ADD CONSTRAINT "bluecast.ai_temp_table_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
