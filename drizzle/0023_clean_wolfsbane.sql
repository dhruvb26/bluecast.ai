CREATE TABLE IF NOT EXISTS "bluecast.ai_instruction" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"user_id" varchar(256) NOT NULL,
	"name" varchar(256) NOT NULL,
	"instructions" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_instruction" ADD CONSTRAINT "bluecast.ai_instruction_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
