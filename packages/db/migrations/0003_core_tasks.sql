CREATE TABLE "core_tasks" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"entity_type" text,
	"entity_id" uuid,
	"title" text NOT NULL,
	"note" text,
	"due_on" date,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "core_tasks" ADD CONSTRAINT "core_tasks_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_tasks_entity_idx" ON "core_tasks" USING btree ("owner_id","entity_type","entity_id");