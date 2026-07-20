-- CreateEnum
CREATE TYPE "EventOccurrenceStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- AlterTable
ALTER TABLE "event_occurrences" ADD COLUMN     "status" "EventOccurrenceStatus" NOT NULL DEFAULT 'ACTIVE';
