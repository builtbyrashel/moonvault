-- AlterTable
ALTER TABLE "Image" ADD COLUMN     "duplicateOfId" TEXT,
ADD COLUMN     "height" INTEGER,
ADD COLUMN     "phash" TEXT,
ADD COLUMN     "processingStatus" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "thumbnailKey" TEXT,
ADD COLUMN     "width" INTEGER;

-- CreateIndex
CREATE INDEX "Image_phash_idx" ON "Image"("phash");
