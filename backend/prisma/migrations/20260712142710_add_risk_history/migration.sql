-- CreateTable
CREATE TABLE "risk_history" (
    "id" TEXT NOT NULL,
    "walletId" TEXT NOT NULL,
    "threatScore" INTEGER NOT NULL,
    "confidence" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "risk_history_walletId_createdAt_idx" ON "risk_history"("walletId", "createdAt");

-- AddForeignKey
ALTER TABLE "risk_history" ADD CONSTRAINT "risk_history_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
