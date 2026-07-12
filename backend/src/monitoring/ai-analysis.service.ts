import { Injectable } from '@nestjs/common'
import type { Severity } from '@prisma/client'
import type { DetectorCategory, DetectorResult } from './detectors/detector.interface'

export interface AiAnalysisResult {
  summary: string
  recommendation: string
  confidence: number
  riskScore: 'low' | 'medium' | 'high' | 'critical'
}

const SEVERITY_TO_RISK_SCORE: Record<Severity, AiAnalysisResult['riskScore']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

const RECOMMENDATIONS: Record<DetectorCategory, string> = {
  LARGE_TRANSFER: 'Verify that the destination address is trusted. If this transfer was not intended, secure the wallet immediately.',
  UNLIMITED_APPROVAL:
    'This approval grants unlimited spending rights to another contract. Consider revoking the approval if it is no longer required.',
  OWNERSHIP_CHANGED: "Review the new owner's address immediately and confirm this change was expected.",
  NEW_CONTRACT: 'New contract counterparties carry unknown risk. Confirm this interaction was intentional before proceeding further.',
  WALLET_INACTIVE: 'No action required. Monitoring will continue at the standard interval.',
}

/**
 * Placeholder rule-based analysis pipeline. Every detector result flows through here to
 * become an AIInsight — swapping this internals for a real LLM call later requires no
 * changes to callers, since the interface (DetectorResult in, AiAnalysisResult out) stays fixed.
 */
@Injectable()
export class AiAnalysisService {
  analyze(result: DetectorResult): AiAnalysisResult {
    return {
      summary: this.buildSummary(result),
      recommendation: RECOMMENDATIONS[result.category],
      confidence: this.confidenceFor(result.category),
      riskScore: SEVERITY_TO_RISK_SCORE[result.severity],
    }
  }

  private buildSummary(result: DetectorResult): string {
    switch (result.category) {
      case 'LARGE_TRANSFER':
        return 'A significant transfer was detected from this wallet.'
      case 'UNLIMITED_APPROVAL':
        return 'An unlimited token approval was detected for a contract.'
      case 'OWNERSHIP_CHANGED':
        return 'The ownership of a monitored contract has changed.'
      case 'NEW_CONTRACT':
        return 'This wallet interacted with a contract it has not interacted with before.'
      case 'WALLET_INACTIVE':
        return result.description
      default:
        return result.description
    }
  }

  private confidenceFor(category: DetectorCategory): number {
    switch (category) {
      case 'OWNERSHIP_CHANGED':
        return 0.97
      case 'UNLIMITED_APPROVAL':
        return 0.95
      case 'LARGE_TRANSFER':
        return 0.9
      case 'NEW_CONTRACT':
        return 0.75
      case 'WALLET_INACTIVE':
        return 0.99
      default:
        return 0.8
    }
  }
}
