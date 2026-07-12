import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import type { Alert, Severity } from '@prisma/client'
import { ThreatAnalysisRepository } from './threat-analysis.repository'
import { RiskScoreEngine, type RiskLevel } from './risk-score.engine'
import { RecommendationEngine } from './recommendation.engine'
import { WalletProfileEngine, type WalletLike } from './wallet-profile.engine'
import { HistoryEngine } from './history.engine'
import { MockAIProvider } from './mock-ai.provider'
import { categorizeAlertTitle } from './alert-category.util'
import type { WalletSecurityResponse } from './dto/wallet-security-response.dto'
import type { WalletSecurityProfile } from './interfaces/wallet-security-profile.interface'

const SEVERITY_WEIGHT: Record<Severity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
const HISTORY_SNAPSHOT_INTERVAL_MS = 60_000

export interface ThreatSnapshot {
  threatScore: number
  riskLevel: RiskLevel
  confidence: number
  profile: WalletSecurityProfile
  recommendations: Array<string>
  summary: string
}

export interface WalletThreatSnapshot extends ThreatSnapshot {
  walletId: string
}

/** Controllers -> this service -> risk/recommendation/profile/history engines + AIProvider -> repository -> Prisma. */
@Injectable()
export class ThreatAnalysisService {
  private readonly logger = new Logger(ThreatAnalysisService.name)

  constructor(
    private readonly repository: ThreatAnalysisRepository,
    private readonly riskScoreEngine: RiskScoreEngine,
    private readonly recommendationEngine: RecommendationEngine,
    private readonly walletProfileEngine: WalletProfileEngine,
    private readonly historyEngine: HistoryEngine,
    private readonly aiProvider: MockAIProvider,
  ) {}

  /** Periodically snapshots every monitored wallet's threat state into RiskHistory, independent of any request. */
  @Interval(HISTORY_SNAPSHOT_INTERVAL_MS)
  async recordHistorySnapshots(): Promise<void> {
    const wallets = await this.repository.getAllMonitoredWallets()
    for (const wallet of wallets) {
      try {
        const snapshot = await this.computeSnapshot(wallet)
        await this.repository.createRiskHistory(wallet.id, snapshot.threatScore, snapshot.confidence, snapshot.summary)
      } catch (err) {
        this.logger.error(`Failed to record risk history for wallet ${wallet.id}: ${(err as Error).message}`)
      }
    }
  }

  async getWalletSecurity(wallet: WalletLike): Promise<WalletSecurityResponse> {
    const snapshot = await this.computeSnapshot(wallet)
    const rows = await this.repository.getRecentRiskHistoryForWallet(wallet.id, 30)

    const riskHistory = rows.length
      ? rows
      : [{ createdAt: new Date(), threatScore: snapshot.threatScore, confidence: snapshot.confidence, summary: snapshot.summary }]

    return {
      wallet: { id: wallet.id, walletName: wallet.walletName, walletAddress: wallet.walletAddress, network: wallet.network },
      threatScore: snapshot.threatScore,
      confidence: snapshot.confidence,
      riskLevel: snapshot.riskLevel,
      recommendations: snapshot.recommendations,
      riskHistory: riskHistory
        .slice()
        .reverse()
        .map((h) => ({
          timestamp: h.createdAt.toISOString(),
          threatScore: h.threatScore,
          confidence: h.confidence,
          summary: h.summary,
        })),
      securityProfile: snapshot.profile,
    }
  }

  /** Current threat state for every wallet a user monitors, computed live with no history side effect — safe to call on every dashboard load. */
  async getSnapshotsForUser(userId: string): Promise<Array<WalletThreatSnapshot>> {
    const wallets = await this.repository.getMonitoredWalletsForUser(userId)
    return Promise.all(wallets.map(async (wallet) => ({ walletId: wallet.id, ...(await this.computeSnapshot(wallet)) })))
  }

  getRiskHistoryGraphForUser(userId: string, since: Date) {
    return this.repository.getRiskHistorySinceForUser(userId, since)
  }

  private async computeSnapshot(wallet: WalletLike): Promise<ThreatSnapshot> {
    const [events, alerts, recentHistory] = await Promise.all([
      this.repository.getEventsForWallet(wallet.id),
      this.repository.getAlertsForWallet(wallet.id),
      this.repository.getRecentRiskHistoryForWallet(wallet.id, 5),
    ])

    const openAlerts = alerts.filter((a) => a.status === 'OPEN')
    const threatScore = this.riskScoreEngine.computeScore(openAlerts)
    const riskLevel = this.riskScoreEngine.levelForScore(threatScore)
    const trend = this.historyEngine.computeTrend(recentHistory)
    const profile = this.walletProfileEngine.build(wallet, events, alerts, trend)

    const categories = new Set(alerts.map((a) => categorizeAlertTitle(a.title)))
    const confidence = this.historyEngine.computeConfidence({
      eventCount: events.length,
      alertCount: alerts.length,
      categoryDiversity: categories.size,
      maxRecurrence: this.maxRecurrence(alerts),
      severityWeight: alerts.reduce((sum, a) => sum + SEVERITY_WEIGHT[a.severity], 0),
    })

    const recommendations = await this.aiProvider.generateRecommendations(alerts)
    const { summary } = await this.aiProvider.analyzeWallet(profile, threatScore)

    return { threatScore, riskLevel, confidence, profile, recommendations, summary }
  }

  private maxRecurrence(alerts: Array<Pick<Alert, 'title'>>): number {
    const counts = new Map<string, number>()
    for (const alert of alerts) {
      const category = categorizeAlertTitle(alert.title)
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }
    return counts.size ? Math.max(...counts.values()) : 0
  }
}
