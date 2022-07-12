-- CreateTable
CREATE TABLE "answers_error" (
    "id" SERIAL NOT NULL,
    "date" TEXT,
    "url" TEXT,
    "error" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "answers_error_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "answers_error_date_key" ON "answers_error"("date");

-- CreateIndex
CREATE UNIQUE INDEX "answers_error_url_key" ON "answers_error"("url");
