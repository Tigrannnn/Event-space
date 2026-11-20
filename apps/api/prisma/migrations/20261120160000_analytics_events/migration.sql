-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('VISIT', 'TOUR_VIEW', 'BOOKING_STARTED');

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "visitor_id" VARCHAR(40) NOT NULL,
    "day" VARCHAR(10) NOT NULL,
    "target_key" VARCHAR(40) NOT NULL DEFAULT '',
    "event_id" TEXT,
    "source_ref" VARCHAR(60),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_events_type_day_idx" ON "analytics_events"("type", "day");

-- CreateIndex
CREATE INDEX "analytics_events_event_id_type_day_idx" ON "analytics_events"("event_id", "type", "day");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_events_type_visitor_id_day_target_key_key" ON "analytics_events"("type", "visitor_id", "day", "target_key");

-- AddForeignKey
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

