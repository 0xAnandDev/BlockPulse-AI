import type { WalletSecurityProfile } from '../interfaces/wallet-security-profile.interface'
import type { RiskLevel } from '../risk-score.engine'
import type { RiskHistoryPoint } from './wallet-security-response.dto'

export interface SecurityReport {
  generatedAt: string
  wallet: { id: string; walletName: string; walletAddress: string; network: string; isMonitoring: boolean; createdAt: string }
  threatScore: number
  riskLevel: RiskLevel
  confidence: number
  securityProfile: WalletSecurityProfile
  alertSummary: { total: number; open: number; bySeverity: Record<string, number> }
  recentAlerts: Array<{ title: string; description: string; severity: string; status: string; createdAt: string }>
  riskHistory: Array<RiskHistoryPoint>
  recommendations: Array<string>
  monitoringStats: { totalEventsTracked: number; lastScannedBlock: string | null; monitoringDurationDays: number }
}
