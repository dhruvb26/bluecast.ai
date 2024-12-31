DO $$ BEGIN
 CREATE TYPE "public"."workspace_role" AS ENUM('org:admin', 'org:member', 'org:client');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_workspace_member" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"workspace_id" varchar(256) NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"role" "workspace_role" DEFAULT 'org:member' NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_workspace_member" ADD CONSTRAINT "bluecast.ai_workspace_member_workspace_id_bluecast.ai_workspace_id_fk" FOREIGN KEY ("workspace_id") REFERENCES "public"."bluecast.ai_workspace"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_workspace_member" ADD CONSTRAINT "bluecast.ai_workspace_member_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
