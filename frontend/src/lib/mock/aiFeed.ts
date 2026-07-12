import type { RiskLevel } from '../dashboard/types'

export interface AiFeedItem {
  id: string
  text: string
  risk: RiskLevel
  time: string
}

export const AI_SECURITY_FEED: Array<AiFeedItem> = [
  {
    id: 'ai-1',
    text: 'Large transfer detected but destination wallet has previous trusted history.',
    risk: 'low',
    time: '2m ago',
  },
  {
    id: 'ai-2',
    text: 'Unlimited token approval detected for a newly deployed contract.',
    risk: 'high',
    time: '18m ago',
  },
  {
    id: 'ai-3',
    text: 'Wallet has been inactive for 43 days. Monitoring continues at standard interval.',
    risk: 'low',
    time: '1h ago',
  },
  {
    id: 'ai-4',
    text: 'Contract ownership changed on a monitored token — this can indicate a rug pull setup.',
    risk: 'critical',
    time: '3h ago',
  },
  {
    id: 'ai-5',
    text: 'Gas spend pattern shifted meaningfully from this wallet’s 30-day baseline.',
    risk: 'medium',
    time: '6h ago',
  },
]
