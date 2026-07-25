-- CreateEnum
CREATE TYPE "EventDifficulty" AS ENUM ('EASY', 'MODERATE', 'HARD');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('SITE_PAYMENT', 'OFFLINE_PAID', 'PAY_ON_ARRIVAL');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('en', 'ru', 'hy');

-- CreateEnum
CREATE TYPE "EventOccurrenceStatus" AS ENUM ('ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "AdjustmentType" AS ENUM ('CHARGE', 'REFUND');

-- CreateEnum
CREATE TYPE "AdjustmentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "category_translations" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "location_url" VARCHAR(1000) NOT NULL,
    "meeting_location_url" VARCHAR(1000) NOT NULL,
    "difficulty" "EventDifficulty",
    "price" DECIMAL(10,2) NOT NULL,
    "duration" INTEGER NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_translations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "description" VARCHAR(1000) NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "meeting_location" VARCHAR(200) NOT NULL,
    "whats_included" VARCHAR(1000)[] DEFAULT ARRAY[]::VARCHAR(1000)[],

    CONSTRAINT "event_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_occurrences" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "EventOccurrenceStatus" NOT NULL DEFAULT 'ACTIVE',
    "max_participants" INTEGER NOT NULL DEFAULT 100,
    "current_participants" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "cancelReason" TEXT,

    CONSTRAINT "event_occurrences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_images" (
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
CREATE TABLE "cancellation_policy_rules" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "hours_before_event" INTEGER NOT NULL,
    "refund_percentage" INTEGER NOT NULL,

    CONSTRAINT "cancellation_policy_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "occurrence_id" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_method" "PaymentMethod" NOT NULL DEFAULT 'SITE_PAYMENT',
    "created_by_admin_id" TEXT,
    "payment_intent_id" TEXT,
    "reference_number" INTEGER,
    "checked_in_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_references" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_adjustments" (
    "id" TEXT NOT NULL,
    "booking_id" TEXT NOT NULL,
    "type" "AdjustmentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "stripe_payment_intent_id" TEXT,
    "stripe_refund_id" TEXT,
    "status" "AdjustmentStatus" NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "name" TEXT NOT NULL,
    "password_hash" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_shadow" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "google_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "hashed_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_category_id_locale_key" ON "category_translations"("category_id", "locale");

-- CreateIndex
CREATE INDEX "events_category_id_idx" ON "events"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_translations_event_id_locale_key" ON "event_translations"("event_id", "locale");

-- CreateIndex
CREATE INDEX "event_occurrences_date_idx" ON "event_occurrences"("date");

-- CreateIndex
CREATE INDEX "event_occurrences_event_id_idx" ON "event_occurrences"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_images_public_id_key" ON "event_images"("public_id");

-- CreateIndex
CREATE INDEX "event_images_event_id_idx" ON "event_images"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "cancellation_policy_rules_event_id_hours_before_event_key" ON "cancellation_policy_rules"("event_id", "hours_before_event");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_payment_intent_id_key" ON "bookings"("payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_reference_number_key" ON "bookings"("reference_number");

-- CreateIndex
CREATE INDEX "bookings_user_id_idx" ON "bookings"("user_id");

-- CreateIndex
CREATE INDEX "bookings_occurrence_id_idx" ON "bookings"("occurrence_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_user_id_occurrence_id_key" ON "bookings"("user_id", "occurrence_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_payment_intent_id_key" ON "booking_adjustments"("stripe_payment_intent_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_adjustments_stripe_refund_id_key" ON "booking_adjustments"("stripe_refund_id");

-- CreateIndex
CREATE INDEX "booking_adjustments_booking_id_idx" ON "booking_adjustments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_translations" ADD CONSTRAINT "event_translations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_occurrences" ADD CONSTRAINT "event_occurrences_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_images" ADD CONSTRAINT "event_images_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cancellation_policy_rules" ADD CONSTRAINT "cancellation_policy_rules_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_occurrence_id_fkey" FOREIGN KEY ("occurrence_id") REFERENCES "event_occurrences"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_adjustments" ADD CONSTRAINT "booking_adjustments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
