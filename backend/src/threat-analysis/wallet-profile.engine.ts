import { Injectable } from '@nestjs/common'
import type { Alert, BlockchainEvent, Wallet } from '@prisma/client'
import { formatEther } from 'ethers'
import type { WalletSecurityProfile } from './interfaces/wallet-security-profile.interface'

const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000
const DAY_MS = 24 * 60 * 60 * 1000

export type WalletLike = Pick<Wallet, 'id' | 'walletName' | 'walletAddress' | 'network' | 'createdAt' | 'isMonitoring'>

/** Builds the continuously-updated wallet security profile from already-persisted events and alerts. */
@Injectable()
export class WalletProfileEngine {
  build(
    wallet: WalletLike,
    events: Array<BlockchainEvent>,
    alerts: Array<Alert>,
    riskTrend: WalletSecurityProfile['riskTrend'],
  ): WalletSecurityProfile {
    const now = Date.now()
    const recentSince = now - RECENT_WINDOW_MS

    const uniqueRecipients = new Set(events.map((e) => e.toAddress?.toLowerCase()).filter((v): v is string => Boolean(v)))
    const activeContracts = new Set(
      events
        .filter((e) => e.eventType === 'CONTRACT_INTERACTION' || e.eventType === 'APPROVAL')
        .map((e) => e.toAddress?.toLowerCase())
        .filter((v): v is string => Boolean(v)),
    )

    const approvalCount = events.filter((e) => e.eventType === 'APPROVAL').length
    const ownershipChanges = events.filter((e) => e.eventType === 'OWNERSHIP_TRANSFER').length
    const largeTransfers = alerts.filter((a) => a.title.toLowerCase().includes('large transfer')).length
    const recentTransactions = events.filter((e) => e.createdAt.getTime() >= recentSince).length

    const transferValues = events.filter((e) => e.eventType === 'TRANSFER').map((e) => BigInt(e.value || '0'))
    const averageTransactionValue = transferValues.length
      ? formatEther(transferValues.reduce((sum, v) => sum + v, 0n) / BigInt(transferValues.length))
      : '0'

    const lastActivity = events.length
      ? events.reduce((latest, e) => (e.createdAt > latest ? e.createdAt : latest), events[0].createdAt)
      : null

    const monitoringDuration = Math.floor((now - wallet.createdAt.getTime()) / DAY_MS)

    return {
      walletAge: monitoringDuration,
      totalTransactions: events.length,
      recentTransactions,
      activeContracts: activeContracts.size,
      uniqueRecipients: uniqueRecipients.size,
      approvalCount,
      ownershipChanges,
      largeTransfers,
      lastActivity,
      averageTransactionValue,
      riskTrend,
      monitoringDuration,
    }
  }
}
