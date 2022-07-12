-- CreateTable
CREATE TABLE "nyt" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url" TEXT,
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
CREATE UNIQUE INDEX "nyt_url_key" ON "nyt"("url");
