/*
  Warnings:

  - You are about to drop the `outbox_events` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "events" ADD COLUMN     "location_url" VARCHAR(1000);

-- DropTable
DROP TABLE "outbox_events";

-- DropEnum
DROP TYPE "OutboxStatus";
