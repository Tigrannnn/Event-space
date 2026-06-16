/*
  Warnings:

  - You are about to drop the column `expires_at` on the `bookings` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('STRIPE', 'OFFLINE');

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "expires_at",
ADD COLUMN     "created_by_admin_id" TEXT,
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL DEFAULT 'STRIPE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_shadow" BOOLEAN NOT NULL DEFAULT false;
