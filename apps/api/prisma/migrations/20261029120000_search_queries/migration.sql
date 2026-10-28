-- CreateTable
CREATE TABLE "search_queries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "query" VARCHAR(100) NOT NULL,
    "normalized" VARCHAR(100) NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_queries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "search_queries_user_id_created_at_idx" ON "search_queries"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "search_queries_normalized_idx" ON "search_queries"("normalized");

-- AddForeignKey
ALTER TABLE "search_queries" ADD CONSTRAINT "search_queries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
