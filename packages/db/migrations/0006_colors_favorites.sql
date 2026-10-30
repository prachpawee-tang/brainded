CREATE TABLE "colors_favorites" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"kind" text NOT NULL,
	"ref" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "colors_favorites" ADD CONSTRAINT "colors_favorites_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "colors_favorites_owner_idx" ON "colors_favorites" USING btree ("owner_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE UNIQUE INDEX "colors_favorites_unique_idx" ON "colors_favorites" USING btree ("owner_id","kind","ref") WHERE "colors_favorites"."deleted_at" is null;