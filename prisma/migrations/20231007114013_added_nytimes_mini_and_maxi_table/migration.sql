-- CreateTable
CREATE TABLE "nytimes_mini" (
    "id" SERIAL NOT NULL,
    "qa_id" TEXT,
    "date" TEXT,
    "url" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nytimes_mini_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nytimes_maxi" (
    "id" SERIAL NOT NULL,
    "qa_id" TEXT,
    "date" TEXT,
    "url" TEXT,
    "questions_answers" JSONB,
    "status" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nytimes_maxi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nytimes_mini_date_key" ON "nytimes_mini"("date");

-- CreateIndex
CREATE UNIQUE INDEX "nytimes_mini_url_key" ON "nytimes_mini"("url");

-- CreateIndex
CREATE UNIQUE INDEX "nytimes_maxi_date_key" ON "nytimes_maxi"("date");

-- CreateIndex
CREATE UNIQUE INDEX "nytimes_maxi_url_key" ON "nytimes_maxi"("url");
