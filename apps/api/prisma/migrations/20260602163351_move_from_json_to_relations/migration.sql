/*
  Warnings:

  - You are about to drop the column `cancellation_policy` on the `events` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "events" DROP COLUMN "cancellation_policy";

-- CreateTable
CREATE TABLE "cancellation_policy_rules" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "hours_before_event" INTEGER NOT NULL,
    "refund_percentage" INTEGER NOT NULL,

    CONSTRAINT "cancellation_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_policy_rules_event_id_hours_before_event_key" ON "cancellation_policy_rules"("event_id", "hours_before_event");

-- AddForeignKey
ALTER TABLE "cancellation_policy_rules" ADD CONSTRAINT "cancellation_policy_rules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
