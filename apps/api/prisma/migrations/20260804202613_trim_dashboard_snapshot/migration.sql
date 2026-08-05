/*
  Warnings:

  - You are about to drop the column `cancelled_bookings` on the `dashboard_snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed_bookings` on the `dashboard_snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `expired_bookings` on the `dashboard_snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `pending_bookings` on the `dashboard_snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `total_bookings` on the `dashboard_snapshots` table. All the data in the column will be lost.
  - You are about to drop the column `total_revenue` on the `dashboard_snapshots` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "dashboard_snapshots" DROP COLUMN "cancelled_bookings",
DROP COLUMN "confirmed_bookings",
DROP COLUMN "expired_bookings",
DROP COLUMN "pending_bookings",
DROP COLUMN "total_bookings",
DROP COLUMN "total_revenue";
