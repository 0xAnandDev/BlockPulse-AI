import type { Alert } from '@prisma/client'
import type { WalletSecurityProfile } from './wallet-security-profile.interface'

export interface AIWalletAnalysis {
  summary: string
}

export interface AIAlertAnalysis {
  summary: string
  recommendation: string
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
}
