CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "name_key" VARCHAR(80) NOT NULL,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "for_bookings" BOOLEAN NOT NULL DEFAULT false,
    "for_reviews" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "channels_code_key" ON "channels"("code");
CREATE UNIQUE INDEX "channels_name_key_key" ON "channels"("name_key");

INSERT INTO "channels" ("id", "code", "name", "name_key", "is_system", "for_bookings", "for_reviews", "updated_at") VALUES
    ('00000000-0000-4000-8000-000000000001', 'DIRECT', 'Direct', 'direct', true, true, false, CURRENT_TIMESTAMP),
    ('00000000-0000-4000-8000-000000000002', 'PLATFORM', 'Our website', 'our website', true, false, false, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'GETYOURGUIDE', 'GetYourGuide', 'getyourguide', false, true, true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'VIATOR', 'Viator', 'viator', false, true, true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'TRIPADVISOR', 'Tripadvisor', 'tripadvisor', false, false, true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'GOOGLE', 'Google', 'google', false, false, true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'INSTAGRAM', 'Instagram', 'instagram', false, false, true, CURRENT_TIMESTAMP),
    (gen_random_uuid()::text, 'FACEBOOK', 'Facebook', 'facebook', false, false, true, CURRENT_TIMESTAMP);

-- "Другая площадка" со свободным названием становится обычным каналом; одинаковые названия сливаются в один.
INSERT INTO "channels" ("id", "code", "name", "name_key", "for_bookings", "updated_at")
SELECT gen_random_uuid()::text, 'CUSTOM_' || substr(md5(lower(n)), 1, 10), n, lower(n), true, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (lower(n)) n
    FROM (
        SELECT btrim(coalesce(nullif(btrim("channel_name"), ''), 'Other')) AS n
        FROM "bookings" WHERE "channel" = 'OTHER'
    ) names
    ORDER BY lower(n), (n = lower(n)), n
) distinct_names
ON CONFLICT ("name_key") DO UPDATE SET "for_bookings" = true;

INSERT INTO "channels" ("id", "code", "name", "name_key", "for_reviews", "updated_at")
SELECT gen_random_uuid()::text, 'CUSTOM_' || substr(md5(lower(n)), 1, 10), n, lower(n), true, CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT ON (lower(n)) n
    FROM (
        SELECT btrim(coalesce(nullif(btrim("source_name"), ''), 'Other')) AS n
        FROM "reviews" WHERE "source" = 'OTHER'
    ) names
    ORDER BY lower(n), (n = lower(n)), n
) distinct_names
ON CONFLICT ("name_key") DO UPDATE SET "for_reviews" = true;

ALTER TABLE "bookings" ADD COLUMN "channel_id" TEXT NOT NULL DEFAULT '00000000-0000-4000-8000-000000000001';
ALTER TABLE "reviews" ADD COLUMN "channel_id" TEXT NOT NULL DEFAULT '00000000-0000-4000-8000-000000000002';

UPDATE "bookings" b SET "channel_id" = c."id"
FROM "channels" c
WHERE b."channel" <> 'OTHER' AND c."code" = b."channel"::text;

UPDATE "bookings" b SET "channel_id" = c."id"
FROM "channels" c
WHERE b."channel" = 'OTHER'
  AND c."name_key" = lower(btrim(coalesce(nullif(btrim(b."channel_name"), ''), 'Other')));

UPDATE "reviews" r SET "channel_id" = c."id"
FROM "channels" c
WHERE r."source" <> 'OTHER' AND c."code" = r."source"::text;

UPDATE "reviews" r SET "channel_id" = c."id"
FROM "channels" c
WHERE r."source" = 'OTHER'
  AND c."name_key" = lower(btrim(coalesce(nullif(btrim(r."source_name"), ''), 'Other')));

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "bookings_channel_id_idx" ON "bookings"("channel_id");
CREATE INDEX "reviews_channel_id_idx" ON "reviews"("channel_id");
CREATE UNIQUE INDEX "bookings_channel_id_external_id_key" ON "bookings"("channel_id", "external_id");
