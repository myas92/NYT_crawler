-- CreateTable
CREATE TABLE "questions_answers" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url_mini_cross" TEXT,
    "url_maxi_cross" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "questions_answers_date_key" ON "questions_answers"("date");

-- CreateIndex
CREATE UNIQUE INDEX "questions_answers_url_mini_cross_key" ON "questions_answers"("url_mini_cross");

-- CreateIndex
CREATE UNIQUE INDEX "questions_answers_url_maxi_cross_key" ON "questions_answers"("url_maxi_cross");
