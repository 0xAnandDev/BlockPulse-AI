import { Injectable } from '@nestjs/common'
import type { RiskHistory } from '@prisma/client'

export interface ConfidenceInputs {
  eventCount: number
  alertCount: number
  categoryDiversity: number
  maxRecurrence: number
  severityWeight: number
}

/** Pure computation over already-persisted data: no Prisma access here (that belongs to the repository). */
@Injectable()
export class HistoryEngine {
  /** Confidence grows with more corroborating signal: event volume, alert recurrence, category diversity, severity. */
  computeConfidence(inputs: ConfidenceInputs): number {
    let confidence = 40
    confidence += Math.min(inputs.eventCount, 20) * 1.5
    confidence += Math.min(inputs.alertCount, 10) * 2
    confidence += inputs.categoryDiversity * 4
    confidence += Math.min(Math.max(inputs.maxRecurrence - 1, 0), 5) * 3
    confidence += Math.min(inputs.severityWeight, 20)
    return Math.max(10, Math.min(99, Math.round(confidence)))
  }

  /** History rows are ordered newest-first; compares the two most recent snapshots. */
  computeTrend(recentHistory: Array<Pick<RiskHistory, 'threatScore'>>): 'increasing' | 'decreasing' | 'stable' {
    if (recentHistory.length < 2) return 'stable'
    const [latest, previous] = recentHistory
    if (latest.threatScore > previous.threatScore + 5) return 'increasing'
    if (latest.threatScore < previous.threatScore - 5) return 'decreasing'
    return 'stable'
  }
}
