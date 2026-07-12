-- DropIndex
DROP INDEX "notifications_walletId_idx";

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "notifications_walletId_createdAt_idx" ON "notifications"("walletId", "createdAt");
