-- History entries of vet results deleted before deletes cleaned up the timeline.
UPDATE "core_timeline_events" AS e
SET "deleted_at" = now()
FROM "pets_lab_results" AS r
WHERE e."kind" = 'pets.lab_result'
  AND e."deleted_at" IS NULL
  AND e."data" ->> 'labResultId' = r."id"::text
  AND r."deleted_at" IS NOT NULL;
