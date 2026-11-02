CREATE TYPE "BookingChannel" AS ENUM ('DIRECT', 'GETYOURGUIDE', 'VIATOR', 'OTHER');

ALTER TABLE "bookings" ADD COLUMN "channel" "BookingChannel" NOT NULL DEFAULT 'DIRECT';
ALTER TABLE "bookings" ADD COLUMN "external_id" VARCHAR(120);

CREATE UNIQUE INDEX "bookings_channel_external_id_key" ON "bookings"("channel", "external_id");
