-- CreateTable
CREATE TABLE "daily_theme_maxi" (
    "id" SERIAL NOT NULL,
    "qa_id" TEXT,
    "date" TEXT,
    "url" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_theme_maxi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "daily_theme_maxi_date_key" ON "daily_theme_maxi"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_theme_maxi_url_key" ON "daily_theme_maxi"("url");
