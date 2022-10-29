/*
  Warnings:

  - You are about to drop the `main_nyt` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `nyt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "main_nyt";

-- DropTable
DROP TABLE "nyt";

-- CreateTable
CREATE TABLE "response_info" (
    "id" SERIAL NOT NULL,
    "qa_id" TEXT,
    "date" TEXT,
    "category" TEXT,
    "response" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "response_info_pkey" PRIMARY KEY ("id")
);
