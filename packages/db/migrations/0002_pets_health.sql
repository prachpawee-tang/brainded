CREATE TYPE "public"."pets_appointment_status" AS ENUM('SCHEDULED', 'DONE', 'CANCELLED');--> statement-breakpoint
CREATE TABLE "core_attachments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"entity_type" text NOT NULL,
	"entity_id" uuid NOT NULL,
	"storage_key" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets_appointments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"pet_id" uuid NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"clinic" text,
	"reason" text NOT NULL,
	"note" text,
	"status" "pets_appointment_status" DEFAULT 'SCHEDULED' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets_lab_results" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"pet_id" uuid NOT NULL,
	"taken_on" date NOT NULL,
	"title" text NOT NULL,
	"clinic" text,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "pets_lab_values" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"lab_result_id" uuid NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"name" text NOT NULL,
	"value" double precision NOT NULL,
	"unit" text,
	"ref_low" double precision,
	"ref_high" double precision
);
--> statement-breakpoint
CREATE TABLE "pets_medication_doses" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"medication_id" uuid NOT NULL,
	"scheduled_on" date NOT NULL,
	"scheduled_time" text NOT NULL,
	"taken_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pets_medications" (
	"id" uuid PRIMARY KEY NOT NULL,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"pet_id" uuid NOT NULL,
	"name" text NOT NULL,
	"dosage" text,
	"times" text[] NOT NULL,
	"every_days" integer DEFAULT 1 NOT NULL,
	"start_on" date NOT NULL,
	"end_on" date,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "core_attachments" ADD CONSTRAINT "core_attachments_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_appointments" ADD CONSTRAINT "pets_appointments_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_appointments" ADD CONSTRAINT "pets_appointments_pet_id_pets_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets_pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_lab_results" ADD CONSTRAINT "pets_lab_results_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_lab_results" ADD CONSTRAINT "pets_lab_results_pet_id_pets_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets_pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_lab_values" ADD CONSTRAINT "pets_lab_values_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_lab_values" ADD CONSTRAINT "pets_lab_values_lab_result_id_pets_lab_results_id_fk" FOREIGN KEY ("lab_result_id") REFERENCES "public"."pets_lab_results"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_medication_doses" ADD CONSTRAINT "pets_medication_doses_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_medication_doses" ADD CONSTRAINT "pets_medication_doses_medication_id_pets_medications_id_fk" FOREIGN KEY ("medication_id") REFERENCES "public"."pets_medications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_medications" ADD CONSTRAINT "pets_medications_owner_id_auth_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."auth_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pets_medications" ADD CONSTRAINT "pets_medications_pet_id_pets_pets_id_fk" FOREIGN KEY ("pet_id") REFERENCES "public"."pets_pets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "core_attachments_entity_idx" ON "core_attachments" USING btree ("owner_id","entity_type","entity_id","position");--> statement-breakpoint
CREATE INDEX "pets_appointments_pet_idx" ON "pets_appointments" USING btree ("pet_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "pets_lab_results_pet_idx" ON "pets_lab_results" USING btree ("pet_id","taken_on" DESC NULLS LAST,"id" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "pets_lab_values_result_idx" ON "pets_lab_values" USING btree ("lab_result_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "pets_medication_doses_slot_idx" ON "pets_medication_doses" USING btree ("medication_id","scheduled_on","scheduled_time");--> statement-breakpoint
CREATE INDEX "pets_medications_pet_idx" ON "pets_medications" USING btree ("pet_id","start_on");