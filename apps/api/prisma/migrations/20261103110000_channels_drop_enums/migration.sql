DROP INDEX "bookings_channel_external_id_key";

ALTER TABLE "bookings" DROP COLUMN "channel", DROP COLUMN "channel_name";
ALTER TABLE "reviews" DROP COLUMN "source", DROP COLUMN "source_name";

DROP TYPE "BookingChannel";
DROP TYPE "ReviewSource";
