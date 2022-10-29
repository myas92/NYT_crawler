-- CreateTable
CREATE TABLE "seven_little_words" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seven_little_words_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seven_little_words_date_key" ON "seven_little_words"("date");

-- CreateIndex
CREATE UNIQUE INDEX "seven_little_words_url_key" ON "seven_little_words"("url");
