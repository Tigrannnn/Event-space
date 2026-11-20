-- CreateTable
CREATE TABLE "source_visits" (
    "id" TEXT NOT NULL,
    "source_id" TEXT,
    "ref" VARCHAR(60) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_visits_source_id_idx" ON "source_visits"("source_id");

-- CreateIndex
CREATE INDEX "source_visits_ref_idx" ON "source_visits"("ref");

-- AddForeignKey
ALTER TABLE "source_visits" ADD CONSTRAINT "source_visits_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

