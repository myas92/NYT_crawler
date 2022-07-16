/*
  Warnings:

  - You are about to drop the `questions_answers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "questions_answers";

-- CreateTable
CREATE TABLE "main_nyt" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url_mini_cross" TEXT,
    "url_maxi_cross" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "main_nyt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "main_nyt_date_key" ON "main_nyt"("date");

-- CreateIndex
CREATE UNIQUE INDEX "main_nyt_url_mini_cross_key" ON "main_nyt"("url_mini_cross");

-- CreateIndex
CREATE UNIQUE INDEX "main_nyt_url_maxi_cross_key" ON "main_nyt"("url_maxi_cross");
