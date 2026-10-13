ALTER TABLE "booking_adjustments" ADD COLUMN "fee_amount" DECIMAL(10,2);

ALTER TABLE "dashboard_snapshots" ADD COLUMN "expected_revenue" DECIMAL(14,2);
