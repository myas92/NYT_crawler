-- CreateTable
CREATE TABLE "xword_maxi" (
    "id" SERIAL NOT NULL,
    "qa_id" TEXT,
    "date" TEXT,
    "url" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xword_maxi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "xword_maxi_date_key" ON "xword_maxi"("date");

-- CreateIndex
CREATE UNIQUE INDEX "xword_maxi_url_key" ON "xword_maxi"("url");
