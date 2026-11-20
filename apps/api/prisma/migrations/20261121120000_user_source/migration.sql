-- AlterTable
ALTER TABLE "users" ADD COLUMN     "source_id" TEXT;

-- CreateIndex
CREATE INDEX "users_source_id_idx" ON "users"("source_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

UPDATE "users" AS "u" SET "source_id" = "first"."source_id"
FROM (
    SELECT DISTINCT ON ("b"."user_id") "b"."user_id", "b"."source_id"
    FROM "bookings" AS "b"
    JOIN "sources" AS "s" ON "s"."id" = "b"."source_id"
    ORDER BY "b"."user_id", ("s"."code" = 'direct'), "b"."created_at"
) AS "first"
WHERE "u"."id" = "first"."user_id" AND "u"."source_id" IS NULL;
