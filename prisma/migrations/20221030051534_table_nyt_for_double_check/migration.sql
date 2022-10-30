-- CreateTable
CREATE TABLE "nyt" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url_mini_cross" TEXT,
    "url_maxi_cross" TEXT,
    "questions_answers" JSONB,
    "questions" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nyt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nyt_date_key" ON "nyt"("date");

-- CreateIndex
CREATE UNIQUE INDEX "nyt_url_mini_cross_key" ON "nyt"("url_mini_cross");

-- CreateIndex
CREATE UNIQUE INDEX "nyt_url_maxi_cross_key" ON "nyt"("url_maxi_cross");
