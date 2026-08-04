-- State metrics on the dashboard cannot be recomputed for a past date: a booking confirmed in
-- January and refunded in April is no longer CONFIRMED today, so "January revenue" queried now
-- would return less than January actually showed. A daily job freezes each finished day here so
-- history stops drifting.
--
-- Flow metrics (bookings created in a period) are deliberately not stored — they derive from
-- created_at, which never changes, and stay live queries.
CREATE TABLE "dashboard_snapshots" (
    "date" DATE NOT NULL,

    "total_events" INTEGER NOT NULL,
    "total_users" INTEGER NOT NULL,

    "published_events" INTEGER NOT NULL,
    "draft_events" INTEGER NOT NULL,
    "cancelled_events" INTEGER NOT NULL,

    "total_bookings" INTEGER NOT NULL,
    "pending_bookings" INTEGER NOT NULL,
    "confirmed_bookings" INTEGER NOT NULL,
    "cancelled_bookings" INTEGER NOT NULL,
    "expired_bookings" INTEGER NOT NULL,

    "total_capacity" INTEGER NOT NULL,
    "used_capacity" INTEGER NOT NULL,

    "total_revenue" DECIMAL(12,2) NOT NULL,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- The day is the primary key, so re-running the job for a date upserts instead of duplicating.
    CONSTRAINT "dashboard_snapshots_pkey" PRIMARY KEY ("date")
);
