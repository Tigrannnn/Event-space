-- Брони с сайта уходят на «Наш сайт» (бывший PLATFORM), а созданные админом без указанной площадки
-- остаются на бывшем DIRECT, который теперь «Не указан».
UPDATE "bookings" SET "channel_id" = '00000000-0000-4000-8000-000000000002'
WHERE "channel_id" = '00000000-0000-4000-8000-000000000001' AND "created_by_admin_id" IS NULL;

-- Канал «Other», который миграция каналов завела для площадок без названия, — то же самое, что «Не указан».
UPDATE "bookings" SET "channel_id" = '00000000-0000-4000-8000-000000000001'
WHERE "channel_id" IN (SELECT "id" FROM "channels" WHERE "name_key" = 'other' AND NOT "is_system");
UPDATE "reviews" SET "channel_id" = '00000000-0000-4000-8000-000000000001'
WHERE "channel_id" IN (SELECT "id" FROM "channels" WHERE "name_key" = 'other' AND NOT "is_system");
DELETE FROM "channels" WHERE "name_key" = 'other' AND NOT "is_system";

UPDATE "channels"
SET "code" = 'UNSPECIFIED', "name" = 'Not specified', "name_key" = 'not specified',
    "for_bookings" = true, "for_reviews" = true, "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = '00000000-0000-4000-8000-000000000001';

UPDATE "channels"
SET "code" = 'SITE', "name" = 'Our site', "name_key" = 'our site',
    "for_bookings" = false, "for_reviews" = false, "updated_at" = CURRENT_TIMESTAMP
WHERE "id" = '00000000-0000-4000-8000-000000000002';

ALTER TABLE "bookings" ALTER COLUMN "channel_id" SET DEFAULT '00000000-0000-4000-8000-000000000002';
