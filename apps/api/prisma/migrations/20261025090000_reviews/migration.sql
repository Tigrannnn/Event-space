CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

ALTER TABLE "events" ADD COLUMN "rating_sum" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "events" ADD COLUMN "rating_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "bookings" ADD COLUMN "review_invite_sent_at" TIMESTAMP(3);

CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "text" VARCHAR(1000),
    "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING',
    "moderated_at" TIMESTAMP(3),
    "moderated_by_admin_id" TEXT,
    "reject_reason" VARCHAR(500),
    "admin_reply" VARCHAR(1000),
    "admin_reply_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "reviews_booking_id_key" ON "reviews"("booking_id");
CREATE INDEX "reviews_event_id_status_created_at_idx" ON "reviews"("event_id", "status", "created_at");
CREATE INDEX "reviews_status_created_at_idx" ON "reviews"("status", "created_at");

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
