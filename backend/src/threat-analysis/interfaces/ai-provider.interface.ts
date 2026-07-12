import type { Alert } from '@prisma/client'
import type { WalletSecurityProfile } from './wallet-security-profile.interface'
import type { RiskLevel } from '../risk-score.engine'

export interface AIWalletAnalysis {
  summary: string
}

export interface AIAlertAnalysis {
  summary: string
  recommendation: string
}

export interface AIAssistantContext {
  wallet: { walletName: string; walletAddress: string; network: string }
  threatScore: number
  riskLevel: RiskLevel
  confidence: number
  profile: WalletSecurityProfile
  alerts: Array<Alert>
  recommendations: Array<string>
}

export interface AIAssistantAnswer {
  answer: string
}

/**
 * Swap point for a real LLM (Claude, OpenAI, Gemini, or a local model). Nothing outside an
 * implementation of this interface needs to change when the provider is replaced — callers only
 * ever depend on this contract, never on MockAIProvider directly.
 */
export interface AIProvider {
  analyzeWallet(profile: WalletSecurityProfile, threatScore: number): Promise<AIWalletAnalysis>
  analyzeAlert(alert: Alert): Promise<AIAlertAnalysis>
  generateRecommendations(alerts: Array<Alert>): Promise<Array<string>>
  /** Answers a free-form question about one wallet's current security state. */
  answerQuestion(context: AIAssistantContext, message: string): Promise<AIAssistantAnswer>
}
