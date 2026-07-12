import { Injectable } from '@nestjs/common'
import type { Alert } from '@prisma/client'
import type {
  AIAlertAnalysis,
  AIAssistantAnswer,
  AIAssistantContext,
  AIProvider,
  AIWalletAnalysis,
} from './interfaces/ai-provider.interface'
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

  async answerQuestion(context: AIAssistantContext, message: string): Promise<AIAssistantAnswer> {
    const q = message.toLowerCase()
    const openAlerts = context.alerts.filter((a) => a.status === 'OPEN')

    if (q.includes('why') && (q.includes('risk') || q.includes('score'))) {
      if (openAlerts.length === 0) {
        return {
          answer: `${context.wallet.walletName} has a threat score of ${context.threatScore}/100 (${context.riskLevel}) because there are no open alerts right now — its recent on-chain activity looks normal.`,
        }
      }
      const reasons = openAlerts.map((a) => `"${a.title}" (${a.severity.toLowerCase()})`).join(', ')
      return {
        answer: `${context.wallet.walletName} is scored ${context.threatScore}/100 (${context.riskLevel}) mainly because of ${openAlerts.length} open alert(s): ${reasons}. Severity and how often these categories repeat both push the score up.`,
      }
    }

    if (q.includes('what should i do') || q.includes('recommend') || q.includes('next step')) {
      const list = context.recommendations.map((r, i) => `${i + 1}) ${r}`).join(' ')
      return { answer: `Here's what I'd prioritize: ${list}` }
    }

    if (q.includes('approval')) {
      return {
        answer: `This wallet has granted ${context.profile.approvalCount} token approval(s) so far. ${
          context.profile.approvalCount > 0
            ? 'Review any unlimited approvals and revoke ones you no longer need.'
            : 'No approvals have been detected yet.'
        }`,
      }
    }

    if (q.includes('ownership')) {
      return {
        answer:
          context.profile.ownershipChanges > 0
            ? `${context.profile.ownershipChanges} ownership change(s) have been detected on contracts this wallet interacts with — review the new owner address(es) in the Alerts tab.`
            : 'No ownership changes have been detected for this wallet.',
      }
    }

    if (q.includes('confiden')) {
      return {
        answer: `Confidence in this wallet's ${context.riskLevel} rating is ${context.confidence}% — it grows with more corroborating on-chain signal (event volume, alert recurrence, and severity).`,
      }
    }

    if (q.includes('recent') || q.includes('activity') || q.includes('transaction')) {
      return {
        answer: `In the last 24 hours this wallet had ${context.profile.recentTransactions} transaction(s), out of ${context.profile.totalTransactions} tracked in total. Last activity: ${
          context.profile.lastActivity ? context.profile.lastActivity.toISOString() : 'no on-chain activity recorded yet'
        }.`,
      }
    }

    return {
      answer: `${context.wallet.walletName} is currently rated ${context.riskLevel} risk (score ${context.threatScore}/100, ${context.confidence}% confidence) with ${openAlerts.length} open alert(s). Ask me why it's rated this way, what to do next, or about approvals, ownership changes, or recent activity.`,
    }
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
