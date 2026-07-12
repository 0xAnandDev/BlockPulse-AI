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
