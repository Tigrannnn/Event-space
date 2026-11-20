CREATE TABLE "sources" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(60) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "name_key" VARCHAR(80) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sources_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "sources_code_key" ON "sources"("code");
CREATE UNIQUE INDEX "sources_name_key_key" ON "sources"("name_key");

ALTER TABLE "bookings" ADD COLUMN "source_id" TEXT,
ADD COLUMN "source_ref" VARCHAR(60);

CREATE INDEX "bookings_source_id_idx" ON "bookings"("source_id");
CREATE INDEX "bookings_source_ref_idx" ON "bookings"("source_ref");

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
