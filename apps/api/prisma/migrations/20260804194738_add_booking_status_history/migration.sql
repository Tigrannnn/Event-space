-- CreateTable
CREATE TABLE "booking_status_history" (
    "id" SERIAL NOT NULL,
    "booking_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL,
    "valid_from" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMP(3),

    CONSTRAINT "booking_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_status_history_booking_id_idx" ON "booking_status_history"("booking_id");

-- CreateIndex
CREATE INDEX "booking_status_history_valid_from_valid_to_idx" ON "booking_status_history"("valid_from", "valid_to");

-- AddForeignKey
ALTER TABLE "booking_status_history" ADD CONSTRAINT "booking_status_history_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- bookings.status is overwritten in place, so every past status is lost the moment it changes.
-- This table keeps one row per period a booking spent in a status (SCD type 2): the open period
-- has valid_to = NULL, and "status as of X" is a plain range lookup instead of a replay of events.
--
-- The rows are written by a trigger rather than by the API, because status is changed from roughly
-- fifteen call sites, several of which are updateMany (mass cancellation when an event or a date is
-- cancelled). A Prisma extension sees the call but not which rows it hit or what their previous
-- statuses were; a row-level trigger sees OLD and NEW for every affected row and cannot be bypassed
-- by updateMany or by raw SQL.

CREATE OR REPLACE FUNCTION "booking_status_history_track"() RETURNS trigger AS $$
BEGIN
	IF TG_OP = 'INSERT' THEN
		INSERT INTO "booking_status_history" ("booking_id", "status", "valid_from", "valid_to")
		VALUES (NEW."id", NEW."status", NEW."created_at", NULL);

		RETURN NEW;
	END IF;

	-- Close the period that is open right now and open the next one at the same instant, so the
	-- periods tile the booking's lifetime with no gap and no overlap. now() is the transaction
	-- timestamp: two status changes inside one transaction produce a zero-length period, which is
	-- what half-open [valid_from, valid_to) intervals should say about a state no reader ever saw.
	UPDATE "booking_status_history"
	SET "valid_to" = now()
	WHERE "booking_id" = NEW."id" AND "valid_to" IS NULL;

	INSERT INTO "booking_status_history" ("booking_id", "status", "valid_from", "valid_to")
	VALUES (NEW."id", NEW."status", now(), NULL);

	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER "bookings_status_history_insert"
AFTER INSERT ON "bookings"
FOR EACH ROW
EXECUTE FUNCTION "booking_status_history_track"();

-- Updates that leave the status alone (quantity, phone, checked_in_at) must not touch the history:
-- UPDATE OF skips statements that never mention the column, WHEN skips writes of an identical value.
CREATE TRIGGER "bookings_status_history_update"
AFTER UPDATE OF "status" ON "bookings"
FOR EACH ROW
WHEN (OLD."status" IS DISTINCT FROM NEW."status")
EXECUTE FUNCTION "booking_status_history_track"();

-- Seed the bookings that already exist. Only their current status is recoverable, so each one gets a
-- single open period reaching back to created_at: it answers "as of X" for any X, but it reports the
-- booking as having always held the status it holds today. Transitions made before this migration
-- are gone. This writes to the history table directly, so the triggers above are not involved.
INSERT INTO "booking_status_history" ("booking_id", "status", "valid_from", "valid_to")
SELECT "id", "status", "created_at", NULL
FROM "bookings";
