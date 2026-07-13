-- AlterEnum
ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED';

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "expired" BOOLEAN NOT NULL DEFAULT false;
