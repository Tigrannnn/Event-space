ALTER TABLE "users" ADD COLUMN "locale" "Locale";

ALTER TABLE "bookings" ADD COLUMN "reminder_sent_at" TIMESTAMP(3);

CREATE INDEX "bookings_reminder_sent_at_idx" ON "bookings"("reminder_sent_at");
