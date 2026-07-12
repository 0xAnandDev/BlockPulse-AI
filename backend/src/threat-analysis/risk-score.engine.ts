import { Injectable } from '@nestjs/common'
import type { Alert } from '@prisma/client'
import type { DetectorCategory } from '../monitoring/detectors/detector.interface'
import { categorizeAlertTitle } from './alert-category.util'

export type RiskLevel = 'safe' | 'low' | 'medium' | 'high' | 'critical'

export interface ThreatScoreWeights {
  LARGE_TRANSFER: number
  UNLIMITED_APPROVAL: number
  OWNERSHIP_CHANGED: number
  NEW_CONTRACT: number
  WALLET_INACTIVE: number
  /** Extra multiplier applied to each repeated occurrence of the same category beyond the first. */
  repeatedEventMultiplier: number
}

export const DEFAULT_THREAT_SCORE_WEIGHTS: ThreatScoreWeights = {
  LARGE_TRANSFER: 20,
  UNLIMITED_APPROVAL: 30,
  OWNERSHIP_CHANGED: 40,
  NEW_CONTRACT: 10,
  WALLET_INACTIVE: 15,
  repeatedEventMultiplier: 1.25,
}

/** Weighted, configurable 0-100 threat scoring engine — a pure function of already-persisted alert history. */
@Injectable()
export class RiskScoreEngine {
  private weights: ThreatScoreWeights = DEFAULT_THREAT_SCORE_WEIGHTS

  setWeights(overrides: Partial<ThreatScoreWeights>): void {
    this.weights = { ...this.weights, ...overrides }
  }

  computeScore(alerts: Array<Alert>): number {
    const counts = new Map<DetectorCategory, number>()
    for (const alert of alerts) {
      const category = categorizeAlertTitle(alert.title)
      counts.set(category, (counts.get(category) ?? 0) + 1)
    }

    let score = 0
    for (const [category, count] of counts) {
      const base = this.weights[category]
      const repeated = Math.max(count - 1, 0)
      score += base + repeated * base * (this.weights.repeatedEventMultiplier - 1)
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  levelForScore(score: number): RiskLevel {
    if (score <= 20) return 'safe'
    if (score <= 40) return 'low'
    if (score <= 60) return 'medium'
    if (score <= 80) return 'high'
    return 'critical'
  }
}
