import { Injectable } from '@nestjs/common'
import type { Alert } from '@prisma/client'
import type { AIAlertAnalysis, AIProvider, AIWalletAnalysis } from './interfaces/ai-provider.interface'
import type { WalletSecurityProfile } from './interfaces/wallet-security-profile.interface'
import { categorizeAlertTitle, RECOMMENDATION_BY_CATEGORY } from './alert-category.util'
import { RecommendationEngine } from './recommendation.engine'

/**
 * Rule-based placeholder AIProvider — same swap contract as monitoring's AiAnalysisService, one
 * level up (whole-wallet scope instead of single-event scope). Do not integrate a real LLM here yet.
 */
@Injectable()
export class MockAIProvider implements AIProvider {
  constructor(private readonly recommendationEngine: RecommendationEngine) {}

  async analyzeWallet(profile: WalletSecurityProfile, threatScore: number): Promise<AIWalletAnalysis> {
    return { summary: this.buildWalletSummary(profile, threatScore) }
  }

  async analyzeAlert(alert: Alert): Promise<AIAlertAnalysis> {
    const category = categorizeAlertTitle(alert.title)
    return { summary: alert.description, recommendation: RECOMMENDATION_BY_CATEGORY[category] }
  }

  async generateRecommendations(alerts: Array<Alert>): Promise<Array<string>> {
    return this.recommendationEngine.generate(alerts)
  }

  private buildWalletSummary(profile: WalletSecurityProfile, threatScore: number): string {
    if (threatScore >= 81) {
      return `Critical risk: ${profile.ownershipChanges} ownership change(s) and ${profile.approvalCount} approval(s) observed across ${profile.totalTransactions} tracked transaction(s).`
    }
    if (threatScore >= 61) {
      return `High risk: recent activity includes ${profile.largeTransfers} large transfer(s) and ${profile.approvalCount} approval(s) that warrant review.`
    }
    if (threatScore >= 41) {
      return `Medium risk: this wallet shows some unusual activity across ${profile.recentTransactions} recent transaction(s).`
    }
    if (threatScore >= 21) {
      return `Low risk: minor anomalies observed across ${profile.totalTransactions} tracked transaction(s), nothing requiring immediate action.`
    }
    return `This wallet's on-chain activity appears normal across ${profile.totalTransactions} tracked transaction(s).`
  }
}
