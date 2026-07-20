/*
  Warnings:

  - The values [STRIPE,OFFLINE] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('SITE_PAYMENT', 'OFFLINE_PAID', 'PAY_ON_ARRIVAL');
ALTER TABLE "public"."bookings" ALTER COLUMN "payment_method" DROP DEFAULT;
ALTER TABLE "bookings" ALTER COLUMN "payment_method" TYPE "PaymentMethod_new" USING ("payment_method"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
ALTER TABLE "bookings" ALTER COLUMN "payment_method" SET DEFAULT 'SITE_PAYMENT';
COMMIT;

-- AlterTable
ALTER TABLE "bookings" ALTER COLUMN "payment_method" SET DEFAULT 'SITE_PAYMENT';

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;
