import type { RiskLevel } from '../dashboard/types'

export interface TimelineEvent {
  id: string
  time: string
  title: string
  detail: string
  risk: RiskLevel
}

export const WALLET_TIMELINE: Array<TimelineEvent> = [
  {
    id: 'evt-1',
    time: '12:42 PM',
    title: 'Incoming transaction detected',
    detail: '0.85 ETH received from a previously seen address.',
    risk: 'low',
  },
  {
    id: 'evt-2',
    time: '12:48 PM',
    title: 'New token approval detected',
    detail: 'Approval granted to a contract deployed 2 days ago.',
    risk: 'medium',
  },
  {
    id: 'evt-3',
    time: '12:51 PM',
    title: 'Large transfer detected',
    detail: '42.3 ETH moved to an address with no prior history.',
    risk: 'high',
  },
  {
    id: 'evt-4',
    time: '1:04 PM',
    title: 'Unlimited approval revoked',
    detail: 'Spending cap removed after AI-recommended action.',
    risk: 'low',
  },
  {
    id: 'evt-5',
    time: '1:19 PM',
    title: 'Contract ownership changed',
    detail: 'Monitored contract owner field was updated on-chain.',
    risk: 'critical',
  },
]
