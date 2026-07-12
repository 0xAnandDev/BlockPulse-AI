export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export type Network = 'Ethereum' | 'Polygon' | 'Base' | 'Arbitrum' | 'Optimism' | 'BNB Chain' | 'Avalanche'

export const NETWORKS: Array<Network> = [
  'Ethereum',
  'Polygon',
  'Base',
  'Arbitrum',
  'Optimism',
  'BNB Chain',
  'Avalanche',
]

export interface Wallet {
  id: string
  walletName: string
  walletAddress: string
  ensName?: string
  network: Network
  isMonitoring: boolean
  /** Placeholder until per-wallet risk scoring is built; not derived from real activity yet. */
  riskScore: RiskLevel
  createdAt: string
  updatedAt: string
}

export type AlertStatus = 'open' | 'resolved' | 'ignored'

export interface AlertItem {
  id: string
  title: string
  detail: string
  timestamp: string
  network: string
  risk: RiskLevel
  status: AlertStatus
  icon: 'transfer' | 'approval' | 'ownership' | 'whale' | 'inactive'
}

export interface TimelineEvent {
  id: string
  time: string
  title: string
  detail: string
  risk: RiskLevel
}

export interface AiFeedItem {
  id: string
  text: string
  risk: RiskLevel
  time: string
}

export interface ChartPoint {
  label: string
  value: number
}

export interface DashboardSummary {
  walletsProtected: number
  activeMonitoring: number
  currentRisk: RiskLevel
  aiConfidence: number
  recentAlerts: Array<AlertItem>
  timeline: Array<TimelineEvent>
  activityGraph: Array<ChartPoint>
  latestInsights: Array<AiFeedItem>
}

export interface WalletSecurityProfile {
  walletAge: number
  totalTransactions: number
  recentTransactions: number
  activeContracts: number
  uniqueRecipients: number
  approvalCount: number
  ownershipChanges: number
  largeTransfers: number
  lastActivity: string | null
  averageTransactionValue: string
  riskTrend: 'increasing' | 'decreasing' | 'stable'
  monitoringDuration: number
}

export interface RiskHistoryPoint {
  timestamp: string
  threatScore: number
  confidence: number
  summary: string
}

export interface WalletSecurity {
  wallet: { id: string; walletName: string; walletAddress: string; network: string }
  threatScore: number
  confidence: number
  riskLevel: RiskLevel | 'safe'
  recommendations: Array<string>
  riskHistory: Array<RiskHistoryPoint>
  securityProfile: WalletSecurityProfile
}

export interface WalletEvent {
  id: string
  transactionHash: string
  blockNumber: string
  eventType: string
  network: string
  fromAddress: string
  toAddress: string | null
  value: string
  status: string
  createdAt: string
}

export type MonitoringPhase = 'idle' | 'scanning' | 'analyzing' | 'ai-analysis' | 'threat-score-updated'

export interface MonitoringStatus {
  phase: MonitoringPhase
  lastScannedBlock: string | null
  latestChainBlock: number
  nextScanInSeconds: number
  pollIntervalSeconds: number
}

export interface AssistantReply {
  answer: string
  threatScore: number
  riskLevel: RiskLevel | 'safe'
}

export interface NotificationItem {
  id: string
  title: string
  detail: string
  walletName: string
  channel: 'email' | 'telegram'
  status: 'sent' | 'failed' | 'pending'
  time: string
}
