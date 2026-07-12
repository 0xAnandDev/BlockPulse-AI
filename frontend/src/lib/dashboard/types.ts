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
  name: string
  address: string
  ensName?: string
  network: Network
  monitoring: boolean
  riskScore: RiskLevel
  lastActivity: string
  createdAt: string
}
