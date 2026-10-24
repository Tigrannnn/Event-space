CREATE TYPE "BannerStatus" AS ENUM ('DRAFT', 'ACTIVE');
CREATE TYPE "BannerTargetType" AS ENUM ('EVENT', 'CATEGORY', 'URL');
CREATE TYPE "BannerTextAlign" AS ENUM ('LEFT', 'CENTER', 'RIGHT');
CREATE TYPE "BannerTheme" AS ENUM ('LIGHT', 'DARK');

CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "image_url" VARCHAR(1000) NOT NULL,
    "image_public_id" VARCHAR(500) NOT NULL,
    "image_mobile_url" VARCHAR(1000),
    "image_mobile_public_id" VARCHAR(500),
    "status" "BannerStatus" NOT NULL DEFAULT 'DRAFT',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMP(3),
    "ends_at" TIMESTAMP(3),
    "target_type" "BannerTargetType" NOT NULL,
    "event_id" TEXT,
    "category_id" TEXT,
    "url" VARCHAR(1000),
    "text_align" "BannerTextAlign" NOT NULL DEFAULT 'LEFT',
    "theme" "BannerTheme" NOT NULL DEFAULT 'DARK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "banner_translations" (
    "id" TEXT NOT NULL,
    "banner_id" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "title" VARCHAR(80) NOT NULL,
    "subtitle" VARCHAR(160),
    "cta_label" VARCHAR(40),

    CONSTRAINT "banner_translations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "banners_image_public_id_key" ON "banners"("image_public_id");
CREATE UNIQUE INDEX "banners_image_mobile_public_id_key" ON "banners"("image_mobile_public_id");
CREATE INDEX "banners_status_sort_order_idx" ON "banners"("status", "sort_order");
CREATE INDEX "banners_event_id_idx" ON "banners"("event_id");
CREATE INDEX "banners_category_id_idx" ON "banners"("category_id");
CREATE UNIQUE INDEX "banner_translations_banner_id_locale_key" ON "banner_translations"("banner_id", "locale");

ALTER TABLE "banners" ADD CONSTRAINT "banners_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "banners" ADD CONSTRAINT "banners_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "banner_translations" ADD CONSTRAINT "banner_translations_banner_id_fkey" FOREIGN KEY ("banner_id") REFERENCES "banners"("id") ON DELETE CASCADE ON UPDATE CASCADE;
