import type { WalletSecurityProfile } from '../interfaces/wallet-security-profile.interface'
import type { RiskLevel } from '../risk-score.engine'

export interface RiskHistoryPoint {
  timestamp: string
  threatScore: number
  confidence: number
  summary: string
}

export interface WalletSecurityResponse {
  wallet: { id: string; walletName: string; walletAddress: string; network: string }
  threatScore: number
  confidence: number
  riskLevel: RiskLevel
  recommendations: Array<string>
  riskHistory: Array<RiskHistoryPoint>
  securityProfile: WalletSecurityProfile
}
