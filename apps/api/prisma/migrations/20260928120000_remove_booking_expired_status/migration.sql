-- Pending bookings no longer expire: an unpaid booking stays PENDING until the user pays or someone
-- cancels it. EXPIRED goes away, and every booking that expired becomes PENDING again — in
-- bookings and in its status history alike, so the history keeps agreeing with the table.

-- Postgres refuses to change the type of a column named in a trigger's WHEN clause, so the update
-- trigger is dropped here and recreated unchanged below. ALTER COLUMN ... TYPE rewrites the rows
-- without firing UPDATE triggers, so the remap itself adds no history rows.
DROP TRIGGER "bookings_status_history_update" ON "bookings";

ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus"
	USING (CASE WHEN "status"::text = 'EXPIRED' THEN 'PENDING' ELSE "status"::text END)::"BookingStatus";
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';

ALTER TABLE "booking_status_history" ALTER COLUMN "status" TYPE "BookingStatus"
	USING (CASE WHEN "status"::text = 'EXPIRED' THEN 'PENDING' ELSE "status"::text END)::"BookingStatus";

DROP TYPE "BookingStatus_old";

CREATE TRIGGER "bookings_status_history_update"
AFTER UPDATE OF "status" ON "bookings"
FOR EACH ROW
WHEN (OLD."status" IS DISTINCT FROM NEW."status")
EXECUTE FUNCTION "booking_status_history_track"();

-- An expired period always followed a PENDING one, and a re-booking opened another PENDING period
-- after it. Mapped to PENDING, these are now back-to-back periods of the same status, which the
-- trigger never produces. Merge each run of them into one period: the earliest row survives,
-- stretched from the first start to the last end (open if any row in the run is open).
WITH ordered AS (
	SELECT
		"id",
		"booking_id",
		"status",
		"valid_from",
		"valid_to",
		LAG("status") OVER (PARTITION BY "booking_id" ORDER BY "valid_from", "id") AS "prev_status"
	FROM "booking_status_history"
),
islands AS (
	SELECT
		*,
		SUM(CASE WHEN "prev_status" IS DISTINCT FROM "status" THEN 1 ELSE 0 END)
			OVER (PARTITION BY "booking_id" ORDER BY "valid_from", "id") AS "run"
	FROM ordered
),
runs AS (
	SELECT
		"booking_id",
		"run",
		MIN("id") AS "keep_id",
		MIN("valid_from") AS "valid_from",
		CASE WHEN BOOL_OR("valid_to" IS NULL) THEN NULL ELSE MAX("valid_to") END AS "valid_to",
		COUNT(*) AS "size"
	FROM islands
	GROUP BY "booking_id", "run"
),
merged AS (
	UPDATE "booking_status_history" h
	SET "valid_from" = r."valid_from", "valid_to" = r."valid_to"
	FROM runs r
	WHERE h."id" = r."keep_id" AND r."size" > 1
	RETURNING h."id"
)
DELETE FROM "booking_status_history" h
USING islands i, runs r
WHERE h."id" = i."id"
	AND i."booking_id" = r."booking_id"
	AND i."run" = r."run"
	AND r."size" > 1
	AND h."id" <> r."keep_id";

ALTER TABLE "bookings" DROP COLUMN "expired";
