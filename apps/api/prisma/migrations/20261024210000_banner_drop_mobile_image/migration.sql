DROP INDEX IF EXISTS "banners_image_mobile_public_id_key";

ALTER TABLE "banners" DROP COLUMN "image_mobile_url";
ALTER TABLE "banners" DROP COLUMN "image_mobile_public_id";
