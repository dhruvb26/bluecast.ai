CREATE TABLE IF NOT EXISTS "bluecast.ai_creator_list_item" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"creator_list_id" varchar(256) NOT NULL,
	"creator_id" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bluecast.ai_creator_list" (
	"id" varchar(256) PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"user_id" varchar(256),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp (3)
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_creator_list_item" ADD CONSTRAINT "bluecast.ai_creator_list_item_creator_list_id_bluecast.ai_creator_list_id_fk" FOREIGN KEY ("creator_list_id") REFERENCES "public"."bluecast.ai_creator_list"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_creator_list_item" ADD CONSTRAINT "bluecast.ai_creator_list_item_creator_id_bluecast.ai_creator_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."bluecast.ai_creator"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bluecast.ai_creator_list" ADD CONSTRAINT "bluecast.ai_creator_list_user_id_bluecast.ai_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."bluecast.ai_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "bluecast.ai_draft" DROP COLUMN IF EXISTS "linked_in_id";