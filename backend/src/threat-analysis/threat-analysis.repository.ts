import { Injectable } from '@nestjs/common'
import type { Alert, BlockchainEvent, RiskHistory, Wallet } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class ThreatAnalysisRepository {
  constructor(private readonly prisma: PrismaService) {}

  getEventsForWallet(walletId: string): Promise<Array<BlockchainEvent>> {
    return this.prisma.blockchainEvent.findMany({ where: { walletId }, orderBy: { createdAt: 'asc' } })
  }

  getAlertsForWallet(walletId: string): Promise<Array<Alert>> {
    return this.prisma.alert.findMany({ where: { walletId }, orderBy: { createdAt: 'desc' } })
  }

  createRiskHistory(walletId: string, threatScore: number, confidence: number, summary: string): Promise<RiskHistory> {
    return this.prisma.riskHistory.create({ data: { walletId, threatScore, confidence, summary } })
  }

  getRecentRiskHistoryForWallet(walletId: string, take = 30): Promise<Array<RiskHistory>> {
    return this.prisma.riskHistory.findMany({ where: { walletId }, orderBy: { createdAt: 'desc' }, take })
  }

  getRiskHistorySinceForUser(userId: string, since: Date): Promise<Array<RiskHistory>> {
    return this.prisma.riskHistory.findMany({
      where: { wallet: { userId }, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    })
  }

  getMonitoredWalletsForUser(userId: string): Promise<Array<Wallet>> {
    return this.prisma.wallet.findMany({ where: { userId, isMonitoring: true } })
  }

  getAllMonitoredWallets(): Promise<Array<Wallet>> {
    return this.prisma.wallet.findMany({ where: { isMonitoring: true } })
  }
}
