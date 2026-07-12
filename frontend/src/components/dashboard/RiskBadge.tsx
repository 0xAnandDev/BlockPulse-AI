import { AlertOctagon, AlertTriangle, ShieldAlert, ShieldCheck } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { RiskLevel } from '../../lib/dashboard/types'

const RISK_CONFIG: Record<RiskLevel, { label: string; icon: typeof ShieldCheck; className: string }> = {
  low: { label: 'Low', icon: ShieldCheck, className: 'severity-low' },
  medium: { label: 'Medium', icon: ShieldAlert, className: 'severity-medium' },
  high: { label: 'High', icon: AlertTriangle, className: 'severity-high' },
  critical: { label: 'Critical', icon: AlertOctagon, className: 'severity-critical' },
}

export default function RiskBadge({ risk, className }: { risk: RiskLevel; className?: string }) {
  const { label, icon: Icon, className: riskClass } = RISK_CONFIG[risk]
  return (
    <span className={cn('pill', riskClass, risk === 'critical' && 'pulse-dot', className)}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {label}
    </span>
  )
}
