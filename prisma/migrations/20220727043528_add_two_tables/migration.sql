-- CreateTable
CREATE TABLE "nyt_maxi" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url_maxi_cross" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nyt_maxi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nyt_mini" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url_mini_cross" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nyt_mini_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nyt_maxi_date_key" ON "nyt_maxi"("date");

-- CreateIndex
CREATE UNIQUE INDEX "nyt_maxi_url_maxi_cross_key" ON "nyt_maxi"("url_maxi_cross");

-- CreateIndex
CREATE UNIQUE INDEX "nyt_mini_date_key" ON "nyt_mini"("date");

-- CreateIndex
CREATE UNIQUE INDEX "nyt_mini_url_mini_cross_key" ON "nyt_mini"("url_mini_cross");
