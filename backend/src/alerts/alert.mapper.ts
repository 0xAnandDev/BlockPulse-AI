import type { AlertWithNetwork } from './alerts.repository'

export interface AlertDto {
  id: string
  title: string
  detail: string
  timestamp: string
  network: string
  risk: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'resolved' | 'ignored'
  icon: 'transfer' | 'approval' | 'ownership' | 'whale' | 'inactive'
}

const RISK_BY_SEVERITY: Record<AlertWithNetwork['severity'], AlertDto['risk']> = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
}

function inferIcon(title: string): AlertDto['icon'] {
  const t = title.toLowerCase()
  if (t.includes('transfer')) return 'transfer'
  if (t.includes('approval')) return 'approval'
  if (t.includes('ownership')) return 'ownership'
  if (t.includes('inactiv')) return 'inactive'
  return 'whale'
}

export function toAlertDto(alert: AlertWithNetwork): AlertDto {
  return {
    id: alert.id,
    title: alert.title,
    detail: alert.description,
    timestamp: alert.createdAt.toISOString(),
    network: alert.wallet.network,
    risk: RISK_BY_SEVERITY[alert.severity],
    status: alert.status.toLowerCase() as AlertDto['status'],
    icon: inferIcon(alert.title),
  }
}
