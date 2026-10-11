UPDATE "events" SET "difficulty" = 'NONE' WHERE "difficulty" IS NULL;

ALTER TABLE "events" ALTER COLUMN "difficulty" SET DEFAULT 'NONE';
ALTER TABLE "events" ALTER COLUMN "difficulty" SET NOT NULL;
