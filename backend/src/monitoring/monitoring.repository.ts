import { Injectable } from '@nestjs/common'
import type { AIInsight, Alert, BlockchainEvent, EventType, Severity, TransactionStatus, Wallet } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateAlertPayload {
  walletId: string
  blockchainEventId?: string
  severity: Severity
  title: string
  description: string
}

export interface CreateInsightPayload {
  walletId: string
  summary: string
  recommendation: string
  confidence: number
  riskScore: string
}

export interface CreateEventInput {
  walletId: string
  transactionHash: string
  blockNumber: bigint
  eventType: EventType
  fromAddress: string
  toAddress: string | null
  value: string
  gasUsed: string | null
  status: TransactionStatus
  rawData: object
}

@Injectable()
export class MonitoringRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMonitoredWallets(): Promise<Array<Wallet>> {
    return this.prisma.wallet.findMany({ where: { isMonitoring: true } })
  }

  /** Creates the event, unless an identical (wallet, txHash, eventType) row already exists — dedup by unique constraint. */
  async createEventIfUnseen(input: CreateEventInput): Promise<BlockchainEvent | null> {
    try {
      return await this.prisma.blockchainEvent.create({ data: input })
    } catch (err) {
      if (this.isUniqueConstraintError(err)) return null
      throw err
    }
  }

  private isUniqueConstraintError(err: unknown): boolean {
    return typeof err === 'object' && err !== null && 'code' in err && (err as { code: unknown }).code === 'P2002'
  }

  async updateLastProcessedBlock(walletId: string, blockNumber: bigint): Promise<void> {
    await this.prisma.wallet.update({ where: { id: walletId }, data: { lastProcessedBlock: blockNumber } })
  }

  /** Distinct contract counterparties already seen for a wallet, for the new-contract-interaction detector. */
  async getKnownCounterparties(walletId: string): Promise<Set<string>> {
    const rows = await this.prisma.blockchainEvent.findMany({
      where: { walletId, toAddress: { not: null } },
      distinct: ['toAddress'],
      select: { toAddress: true },
    })
    return new Set(rows.map((r) => r.toAddress!.toLowerCase()))
  }

  async getLastEventAt(walletId: string): Promise<Date | null> {
    const latest = await this.prisma.blockchainEvent.findFirst({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })
    return latest?.createdAt ?? null
  }

  findLatestForUser(userId: string, take = 50): Promise<Array<BlockchainEvent>> {
    return this.prisma.blockchainEvent.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: 'desc' },
      take,
    })
  }

  countSince(userId: string, since: Date): Promise<number> {
    return this.prisma.blockchainEvent.count({
      where: { wallet: { userId }, createdAt: { gte: since } },
    })
  }

  findSinceForUser(userId: string, since: Date): Promise<Array<BlockchainEvent>> {
    return this.prisma.blockchainEvent.findMany({
      where: { wallet: { userId }, createdAt: { gte: since } },
      orderBy: { createdAt: 'asc' },
    })
  }

  /** Creates an Alert and its AIInsight atomically, so one never exists without the other. */
  createAlertWithInsight(
    alertPayload: CreateAlertPayload,
    insightPayload: CreateInsightPayload,
  ): Promise<{ alert: Alert; insight: AIInsight }> {
    return this.prisma.$transaction(async (tx) => {
      const alert = await tx.alert.create({ data: alertPayload })
      const insight = await tx.aIInsight.create({ data: { ...insightPayload, alertId: alert.id } })
      return { alert, insight }
    })
  }
}
