-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AdjustmentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "public"."AdjustmentType" AS ENUM ('CHARGE', 'REFUND');

-- CreateEnum
CREATE TYPE "public"."BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "public"."EventDifficulty" AS ENUM ('EASY', 'MODERATE', 'HARD');

-- CreateEnum
CREATE TYPE "public"."EventOccurrenceStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."Locale" AS ENUM ('en', 'ru', 'hy');

-- CreateEnum
CREATE TYPE "public"."PaymentMethod" AS ENUM ('SITE_PAYMENT', 'OFFLINE_PAID', 'PAY_ON_ARRIVAL');

-- CreateEnum
CREATE TYPE "public"."UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "public"."booking_adjustments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "type" "public"."AdjustmentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_payment_intent_id" TEXT,
    "stripe_refund_id" TEXT,
    "status" "public"."AdjustmentStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."booking_references" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "public"."PaymentMethod" NOT NULL DEFAULT 'SITE_PAYMENT',
    "created_by_admin_id" TEXT,
    "payment_intent_id" TEXT,
    "reference_number" INTEGER,
    "checked_in_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cancellation_policy_rules" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "hours_before_event" INTEGER NOT NULL,
    "refund_percentage" INTEGER NOT NULL,

    CONSTRAINT "cancellation_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."category_translations" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_images" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "public_id" VARCHAR(500) NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_occurrences" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "public"."EventOccurrenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "max_participants" INTEGER NOT NULL DEFAULT 100,
    "current_participants" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "event_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."event_translations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "locale" "public"."Locale" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "meeting_location" VARCHAR(200) NOT NULL,
    "whats_included" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],

    CONSTRAINT "event_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."events" (
    "id" TEXT NOT NULL,
    "location_url" VARCHAR(1000) NOT NULL,
    "meeting_location_url" VARCHAR(1000) NOT NULL,
    "difficulty" "public"."EventDifficulty",
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "public"."EventStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."refresh_tokens" (
    "id" TEXT NOT NULL,
    "hashed_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "image" TEXT,
    "role" "public"."UserRole" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_shadow" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "google_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "booking_adjustments_booking_id_idx" ON "public"."booking_adjustments"("booking_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_payment_intent_id_key" ON "public"."booking_adjustments"("stripe_payment_intent_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_refund_id_key" ON "public"."booking_adjustments"("stripe_refund_id" ASC);

-- CreateIndex
CREATE INDEX "bookings_occurrence_id_idx" ON "public"."bookings"("occurrence_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_payment_intent_id_key" ON "public"."bookings"("payment_intent_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_reference_number_key" ON "public"."bookings"("reference_number" ASC);

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "public"."bookings"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "bookings_user_id_occurrence_id_key" ON "public"."bookings"("user_id" ASC, "occurrence_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_policy_rules_event_id_hours_before_event_key" ON "public"."cancellation_policy_rules"("event_id" ASC, "hours_before_event" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "public"."categories"("slug" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "public"."category_translations"("category_id" ASC, "locale" ASC);

-- CreateIndex
CREATE INDEX "event_images_event_id_idx" ON "public"."event_images"("event_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "event_images_public_id_key" ON "public"."event_images"("public_id" ASC);

-- CreateIndex
CREATE INDEX "event_occurrences_date_idx" ON "public"."event_occurrences"("date" ASC);

-- CreateIndex
CREATE INDEX "event_occurrences_event_id_idx" ON "public"."event_occurrences"("event_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "event_translations_event_id_locale_key" ON "public"."event_translations"("event_id" ASC, "locale" ASC);

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "public"."events"("category_id" ASC);

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "public"."refresh_tokens"("user_id" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email" ASC);

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "public"."users"("google_id" ASC);

-- AddForeignKey
ALTER TABLE "public"."booking_adjustments" ADD CONSTRAINT "booking_adjustments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "public"."event_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cancellation_policy_rules" ADD CONSTRAINT "cancellation_policy_rules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_images" ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_occurrences" ADD CONSTRAINT "event_occurrences_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."event_translations" ADD CONSTRAINT "event_translations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

