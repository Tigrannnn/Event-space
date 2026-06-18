-- CreateTable
CREATE TABLE "booking_references" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_references_pkey" PRIMARY KEY ("id")
);
