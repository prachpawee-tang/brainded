ALTER TABLE "pets_lab_values" ALTER COLUMN "value" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "pets_lab_results" ADD COLUMN "remark" text;--> statement-breakpoint
ALTER TABLE "pets_lab_results" ADD COLUMN "interpretation" text;--> statement-breakpoint
ALTER TABLE "pets_lab_values" ADD COLUMN "section" text DEFAULT 'OTHER' NOT NULL;--> statement-breakpoint
ALTER TABLE "pets_lab_values" ADD COLUMN "code" text;--> statement-breakpoint
-- Existing values: group by their upper-cased name (catalog codes for new values come from the app).
UPDATE "pets_lab_values" SET "code" = upper(btrim(regexp_replace("name", '\s+', ' ', 'g')));--> statement-breakpoint
ALTER TABLE "pets_lab_values" ALTER COLUMN "code" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "pets_lab_values" ADD COLUMN "text_value" text;--> statement-breakpoint
CREATE INDEX "pets_lab_values_code_idx" ON "pets_lab_values" USING btree ("owner_id","code");--> statement-breakpoint
ALTER TABLE "pets_lab_values" ADD CONSTRAINT "pets_lab_values_one_value" CHECK (("pets_lab_values"."value" is null) <> ("pets_lab_values"."text_value" is null));