import { Injectable } from '@nestjs/common'
import type { BlockchainEvent, RiskHistory } from '@prisma/client'
import { WalletsService } from '../wallets/services/wallets.service'
import { AlertsService } from '../alerts/alerts.service'
import { MonitoringRepository } from '../monitoring/monitoring.repository'
import { ThreatAnalysisService, type WalletThreatSnapshot } from '../threat-analysis/threat-analysis.service'
import type { RiskLevel } from '../threat-analysis/risk-score.engine'

type FrontendRisk = 'low' | 'medium' | 'high' | 'critical'

const RISK_RANK: Record<RiskLevel, number> = { safe: 0, low: 1, medium: 2, high: 3, critical: 4 }
const ACTIVITY_GRAPH_HOURS = 24
const ACTIVITY_GRAPH_BUCKETS = 12
const DEFAULT_AI_CONFIDENCE = 98

@Injectable()
export class DashboardService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly alertsService: AlertsService,
    private readonly monitoringRepository: MonitoringRepository,
    private readonly threatAnalysisService: ThreatAnalysisService,
  ) {}

  async getSummary(userId: string) {
    const since = new Date(Date.now() - ACTIVITY_GRAPH_HOURS * 60 * 60 * 1000)

    const [wallets, recentAlerts, timelineEvents, snapshots, riskHistory] = await Promise.all([
      this.walletsService.findAllForUser(userId),
      this.alertsService.findAllForUser(userId),
      this.monitoringRepository.findLatestForUser(userId, 8),
      this.threatAnalysisService.getSnapshotsForUser(userId),
      this.threatAnalysisService.getRiskHistoryGraphForUser(userId, since),
    ])

    return {
      walletsProtected: wallets.length,
      activeMonitoring: wallets.filter((w) => w.isMonitoring).length,
      currentRisk: this.toFrontendRisk(this.computeOverallRisk(snapshots)),
      aiConfidence: this.computeAiConfidence(snapshots),
      recentAlerts: recentAlerts.slice(0, 5),
      timeline: timelineEvents.map((e) => this.toTimelineDto(e)),
      activityGraph: this.buildActivityGraph(riskHistory),
      latestInsights: this.buildLatestInsights(snapshots),
    }
  }

  private computeOverallRisk(snapshots: Array<WalletThreatSnapshot>): RiskLevel {
    if (snapshots.length === 0) return 'safe'
    return snapshots.reduce((max, s) => (RISK_RANK[s.riskLevel] > RISK_RANK[max.riskLevel] ? s : max)).riskLevel
  }

  /** Frontend's RiskLevel union has no 'safe' tier — collapse it into 'low'. */
  private toFrontendRisk(level: RiskLevel): FrontendRisk {
    return level === 'safe' ? 'low' : level
  }

  private computeAiConfidence(snapshots: Array<WalletThreatSnapshot>): number {
    if (snapshots.length === 0) return DEFAULT_AI_CONFIDENCE
    return Math.round(snapshots.reduce((sum, s) => sum + s.confidence, 0) / snapshots.length)
  }

  private buildLatestInsights(snapshots: Array<WalletThreatSnapshot>) {
    return snapshots
      .slice()
      .sort((a, b) => RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel])
      .slice(0, 5)
      .map((s) => ({
        id: `${s.walletId}-insight`,
        text: s.recommendations[0] ?? s.summary,
        risk: this.toFrontendRisk(s.riskLevel),
        time: new Date().toISOString(),
      }))
  }

  private toTimelineDto(event: BlockchainEvent) {
    return {
      id: event.id,
      time: event.createdAt.toISOString(),
      title: this.eventTitle(event),
      detail: `Transaction ${event.transactionHash.slice(0, 10)}...`,
      risk: this.eventTypeToRisk(event),
    }
  }

  private eventTitle(event: BlockchainEvent): string {
    switch (event.eventType) {
      case 'TRANSFER':
        return 'Transaction detected'
      case 'APPROVAL':
        return 'Token approval detected'
      case 'OWNERSHIP_TRANSFER':
        return 'Ownership change detected'
      case 'CONTRACT_INTERACTION':
        return 'Contract interaction detected'
      default:
        return 'On-chain event detected'
    }
  }

  private eventTypeToRisk(event: BlockchainEvent): string {
    if (event.eventType === 'OWNERSHIP_TRANSFER') return 'critical'
    if (event.eventType === 'APPROVAL') return 'medium'
    return 'low'
  }

  /** Activity graph is now driven by the Risk History timeline (average threat score per bucket) rather than raw event counts. */
  private buildActivityGraph(history: Array<RiskHistory>) {
    const bucketMs = (ACTIVITY_GRAPH_HOURS * 60 * 60 * 1000) / ACTIVITY_GRAPH_BUCKETS
    const now = Date.now()
    const buckets = Array.from({ length: ACTIVITY_GRAPH_BUCKETS }, (_, i) => {
      const bucketStart = now - (ACTIVITY_GRAPH_BUCKETS - i) * bucketMs
      return {
        label: this.formatHourLabel(new Date(bucketStart)),
        start: bucketStart,
        end: bucketStart + bucketMs,
        sum: 0,
        count: 0,
      }
    })

    for (const row of history) {
      const t = row.createdAt.getTime()
      const bucket = buckets.find((b) => t >= b.start && t < b.end)
      if (bucket) {
        bucket.sum += row.threatScore
        bucket.count += 1
      }
    }

    return buckets.map(({ label, sum, count }) => ({ label, value: count ? Math.round(sum / count) : 0 }))
  }

  private formatHourLabel(date: Date): string {
    const hours = date.getHours()
    const period = hours >= 12 ? 'p' : 'a'
    const displayHour = hours % 12 === 0 ? 12 : hours % 12
    return `${displayHour}${period}`
  }
}
