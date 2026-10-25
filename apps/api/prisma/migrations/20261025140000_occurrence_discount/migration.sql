-- AlterTable
ALTER TABLE "event_occurrences" ADD COLUMN     "discount_percent" INTEGER;

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "base_amount" DECIMAL(10,2),
ADD COLUMN     "discount_percent" INTEGER;
