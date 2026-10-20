CREATE TYPE "public"."pets_sex" AS ENUM('MALE', 'FEMALE', 'UNKNOWN');--> statement-breakpoint
CREATE TYPE "public"."pets_species" AS ENUM('DOG', 'CAT', 'OTHER');--> statement-breakpoint
CREATE TABLE "core_timeline_events" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"occurred_on" date NOT NULL,
	"body" text,
	"data" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets_weight_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"pet_id" uuid NOT NULL,
	"weight_grams" integer NOT NULL,
	"measured_on" date NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "pets_pets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"name" text NOT NULL,
	"species" "pets_species" NOT NULL,
	"species_other" text,
	"breed" text,
	"sex" "pets_sex" DEFAULT 'UNKNOWN' NOT NULL,
	"birth_date" date,
	"photo_key" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "core_timeline_events" ADD CONSTRAINT "core_timeline_events_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_weight_logs" ADD CONSTRAINT "pets_weight_logs_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_weight_logs" ADD CONSTRAINT "pets_weight_logs_pet_id_pets_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets_pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_pets" ADD CONSTRAINT "pets_pets_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_timeline_events_entity_idx" ON "core_timeline_events" USING btree ("owner_id","entity_type","entity_id","occurred_on" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pets_weight_logs_pet_idx" ON "pets_weight_logs" USING btree ("pet_id","measured_on" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pets_pets_owner_idx" ON "pets_pets" USING btree ("owner_id","created_at");