import type { RiskLevel } from '../dashboard/types'

export type AlertStatus = 'open' | 'reviewed' | 'resolved'

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

export const ALERTS: Array<AlertItem> = [
  {
    id: 'alert-1',
    title: 'Large transfer detected',
    detail: '42.3 ETH transferred to an address with no prior interaction history.',
    timestamp: 'Today, 12:51 PM',
    network: 'Ethereum',
    risk: 'high',
    status: 'open',
    icon: 'transfer',
  },
  {
    id: 'alert-2',
    title: 'Contract ownership changed',
    detail: 'Owner field updated on a monitored token contract — possible rug risk.',
    timestamp: 'Today, 1:19 PM',
    network: 'Base',
    risk: 'critical',
    status: 'open',
    icon: 'ownership',
  },
  {
    id: 'alert-3',
    title: 'Unlimited approval granted',
    detail: 'Approval with no spending cap granted to a contract deployed 2 days ago.',
    timestamp: 'Today, 12:48 PM',
    network: 'Polygon',
    risk: 'medium',
    status: 'reviewed',
    icon: 'approval',
  },
  {
    id: 'alert-4',
    title: 'Whale activity nearby',
    detail: 'A wallet you interact with regularly moved a large position.',
    timestamp: 'Yesterday, 8:03 PM',
    network: 'Arbitrum',
    risk: 'low',
    status: 'resolved',
    icon: 'whale',
  },
  {
    id: 'alert-5',
    title: 'Wallet inactivity notice',
    detail: 'No on-chain activity for 43 consecutive days.',
    timestamp: '3 days ago',
    network: 'Optimism',
    risk: 'low',
    status: 'resolved',
    icon: 'inactive',
  },
]
