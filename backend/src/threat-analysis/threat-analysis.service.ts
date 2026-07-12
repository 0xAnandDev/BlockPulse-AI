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
import type { SecurityReport } from './dto/security-report.dto'
import type { WalletSecurityProfile } from './interfaces/wallet-security-profile.interface'
import { AlertsService } from '../alerts/alerts.service'
import type { AlertDto } from '../alerts/alert.mapper'
import { MonitoringStatusService } from '../monitoring/monitoring-status.service'
import { EthereumProviderService } from '../ethereum/ethereum-provider.service'
import { toEventDto, type EventDto } from '../monitoring/event.mapper'

const SEVERITY_WEIGHT: Record<Severity, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }
const HISTORY_SNAPSHOT_INTERVAL_MS = 60_000
const MONITORING_POLL_INTERVAL_MS = 20_000

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

export interface MonitoringStatusResponse {
  phase: string
  lastScannedBlock: string | null
  latestChainBlock: number
  nextScanInSeconds: number
  pollIntervalSeconds: number
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
    private readonly alertsService: AlertsService,
    private readonly monitoringStatusService: MonitoringStatusService,
    private readonly ethereumProvider: EthereumProviderService,
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
    if (wallets.length > 0) this.monitoringStatusService.setPhase('threat-score-updated')
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

  async getEventsForWallet(walletId: string, take = 50): Promise<Array<EventDto>> {
    const events = await this.repository.getRecentEventsForWallet(walletId, take)
    return events.map(toEventDto)
  }

  getAlertsForWallet(walletId: string): Promise<Array<AlertDto>> {
    return this.alertsService.findAllForWallet(walletId)
  }

  async getMonitoringStatus(wallet: WalletLike): Promise<MonitoringStatusResponse> {
    const [rawWallet, latestChainBlock] = await Promise.all([
      this.repository.getWalletRaw(wallet.id),
      this.ethereumProvider.getLatestBlockNumber(),
    ])
    const status = this.monitoringStatusService.getSnapshot()
    const nextScanInSeconds = Math.max(0, Math.round((new Date(status.nextScanAt).getTime() - Date.now()) / 1000))

    return {
      phase: status.phase,
      lastScannedBlock: rawWallet?.lastProcessedBlock != null ? rawWallet.lastProcessedBlock.toString() : null,
      latestChainBlock,
      nextScanInSeconds,
      pollIntervalSeconds: MONITORING_POLL_INTERVAL_MS / 1000,
    }
  }

  async askAssistant(wallet: WalletLike, message: string): Promise<{ answer: string; threatScore: number; riskLevel: RiskLevel }> {
    const [snapshot, alerts] = await Promise.all([this.computeSnapshot(wallet), this.repository.getAlertsForWallet(wallet.id)])

    const { answer } = await this.aiProvider.answerQuestion(
      {
        wallet: { walletName: wallet.walletName, walletAddress: wallet.walletAddress, network: wallet.network },
        threatScore: snapshot.threatScore,
        riskLevel: snapshot.riskLevel,
        confidence: snapshot.confidence,
        profile: snapshot.profile,
        alerts,
        recommendations: snapshot.recommendations,
      },
      message,
    )

    return { answer, threatScore: snapshot.threatScore, riskLevel: snapshot.riskLevel }
  }

  async buildReport(wallet: WalletLike): Promise<SecurityReport> {
    const [snapshot, alerts, riskHistoryRows, eventCount, rawWallet] = await Promise.all([
      this.computeSnapshot(wallet),
      this.repository.getAlertsForWallet(wallet.id),
      this.repository.getRecentRiskHistoryForWallet(wallet.id, 30),
      this.repository.getEventsForWallet(wallet.id).then((events) => events.length),
      this.repository.getWalletRaw(wallet.id),
    ])

    const bySeverity: Record<string, number> = {}
    for (const alert of alerts) {
      bySeverity[alert.severity] = (bySeverity[alert.severity] ?? 0) + 1
    }

    return {
      generatedAt: new Date().toISOString(),
      wallet: {
        id: wallet.id,
        walletName: wallet.walletName,
        walletAddress: wallet.walletAddress,
        network: wallet.network,
        isMonitoring: wallet.isMonitoring,
        createdAt: wallet.createdAt.toISOString(),
      },
      threatScore: snapshot.threatScore,
      riskLevel: snapshot.riskLevel,
      confidence: snapshot.confidence,
      securityProfile: snapshot.profile,
      alertSummary: { total: alerts.length, open: alerts.filter((a) => a.status === 'OPEN').length, bySeverity },
      recentAlerts: alerts.slice(0, 15).map((a) => ({
        title: a.title,
        description: a.description,
        severity: a.severity,
        status: a.status,
        createdAt: a.createdAt.toISOString(),
      })),
      riskHistory: riskHistoryRows
        .slice()
        .reverse()
        .map((h) => ({ timestamp: h.createdAt.toISOString(), threatScore: h.threatScore, confidence: h.confidence, summary: h.summary })),
      recommendations: snapshot.recommendations,
      monitoringStats: {
        totalEventsTracked: eventCount,
        lastScannedBlock: rawWallet?.lastProcessedBlock != null ? rawWallet.lastProcessedBlock.toString() : null,
        monitoringDurationDays: snapshot.profile.monitoringDuration,
      },
    }
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
