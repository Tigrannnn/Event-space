CREATE TYPE "SourceKind" AS ENUM ('PARTNER', 'PLATFORM');

ALTER TABLE "source_visits" DROP CONSTRAINT "source_visits_source_id_fkey";

ALTER TABLE "sources" ADD COLUMN "kind" "SourceKind" NOT NULL DEFAULT 'PARTNER';

DROP TABLE "source_visits";

INSERT INTO "sources" ("id", "code", "name", "name_key", "kind", "updated_at") VALUES
    ('00000000-0000-4000-9000-000000000001', 'instagram', 'Instagram', 'platform:instagram', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000002', 'facebook', 'Facebook', 'platform:facebook', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000003', 'google', 'Google', 'platform:google', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000004', 'telegram', 'Telegram', 'platform:telegram', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000005', 'whatsapp', 'WhatsApp', 'platform:whatsapp', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000006', 'tiktok', 'TikTok', 'platform:tiktok', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000007', 'other', 'Other sites', 'platform:other', 'PLATFORM', CURRENT_TIMESTAMP),
    ('00000000-0000-4000-9000-000000000008', 'direct', 'Direct', 'platform:direct', 'PLATFORM', CURRENT_TIMESTAMP)
ON CONFLICT ("code") DO UPDATE SET "kind" = 'PLATFORM', "is_active" = true, "updated_at" = CURRENT_TIMESTAMP;

UPDATE "bookings" SET "source_ref" = CASE "source_ref"
    WHEN 'ig' THEN 'instagram' WHEN 'insta' THEN 'instagram'
    WHEN 'fb' THEN 'facebook' WHEN 'meta' THEN 'facebook'
    WHEN 'tg' THEN 'telegram' WHEN 'wa' THEN 'whatsapp' WHEN 'tt' THEN 'tiktok'
END
WHERE "source_ref" IN ('ig', 'insta', 'fb', 'meta', 'tg', 'wa', 'tt');

UPDATE "analytics_events" SET "source_ref" = CASE "source_ref"
    WHEN 'ig' THEN 'instagram' WHEN 'insta' THEN 'instagram'
    WHEN 'fb' THEN 'facebook' WHEN 'meta' THEN 'facebook'
    WHEN 'tg' THEN 'telegram' WHEN 'wa' THEN 'whatsapp' WHEN 'tt' THEN 'tiktok'
END
WHERE "source_ref" IN ('ig', 'insta', 'fb', 'meta', 'tg', 'wa', 'tt');

UPDATE "analytics_events" SET "source_ref" = 'direct' WHERE "source_ref" IS NULL;

INSERT INTO "sources" ("id", "code", "name", "name_key", "updated_at")
SELECT gen_random_uuid()::text, "ref", "ref", 'ref:' || "ref", CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT "source_ref" AS "ref" FROM "bookings" WHERE "source_ref" IS NOT NULL
    UNION
    SELECT DISTINCT "source_ref" FROM "analytics_events" WHERE "source_ref" IS NOT NULL
) AS "refs"
ON CONFLICT DO NOTHING;

UPDATE "bookings" AS "b" SET "source_id" = "s"."id"
FROM "sources" AS "s"
WHERE "b"."source_id" IS NULL AND "b"."source_ref" = "s"."code";

UPDATE "bookings" SET "source_id" = (SELECT "id" FROM "sources" WHERE "code" = 'direct'), "source_ref" = 'direct'
WHERE "source_id" IS NULL AND "source_ref" IS NULL AND "created_by_admin_id" IS NULL;
