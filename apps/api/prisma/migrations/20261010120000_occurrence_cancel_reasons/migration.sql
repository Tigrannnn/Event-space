ALTER TABLE "event_occurrences" ADD COLUMN "cancel_reason_ru" VARCHAR(500);
ALTER TABLE "event_occurrences" ADD COLUMN "cancel_reason_en" VARCHAR(500);
ALTER TABLE "event_occurrences" ADD COLUMN "cancel_reason_hy" VARCHAR(500);

UPDATE "event_occurrences"
SET "cancel_reason_ru" = left(btrim("cancelReason"), 500)
WHERE "cancelReason" IS NOT NULL AND btrim("cancelReason") <> '';

ALTER TABLE "event_occurrences" DROP COLUMN "cancelReason";
