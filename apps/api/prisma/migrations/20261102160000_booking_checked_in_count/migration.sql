ALTER TABLE "bookings" ADD COLUMN "checked_in_count" INTEGER NOT NULL DEFAULT 0;

UPDATE "bookings" SET "checked_in_count" = "quantity" WHERE "checked_in_at" IS NOT NULL;
