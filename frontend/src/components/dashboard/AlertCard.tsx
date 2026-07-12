import { motion } from 'motion/react'
import { ArrowUpRight, CircleDollarSign, Crown, Moon, ShieldQuestion } from 'lucide-react'
import RiskBadge from './RiskBadge'
import type { AlertItem, AlertStatus } from '../../lib/dashboard/types'

const ICONS: Record<AlertItem['icon'], typeof ArrowUpRight> = {
  transfer: ArrowUpRight,
  approval: ShieldQuestion,
  ownership: Crown,
  whale: CircleDollarSign,
  inactive: Moon,
}

const STATUS_LABEL: Record<AlertStatus, string> = {
  open: 'Open',
  ignored: 'Ignored',
  resolved: 'Resolved',
}

const STATUS_CLASS: Record<AlertStatus, string> = {
  open: 'text-[var(--risk-high)]',
  ignored: 'text-[var(--ink-faint)]',
  resolved: 'text-[var(--risk-low)]',
}

export default function AlertCard({ alert, index }: { alert: AlertItem; index: number }) {
  const Icon = ICONS[alert.icon]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
      className="panel flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center"
    >
      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-[var(--ink)]">{alert.title}</p>
          <RiskBadge risk={alert.risk} />
        </div>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{alert.detail}</p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-faint)]">
          <span>{alert.timestamp}</span>
          <span aria-hidden="true">&middot;</span>
          <span className="pill">{alert.network}</span>
        </div>
      </div>

      <span className={`flex-shrink-0 text-xs font-semibold uppercase tracking-wide ${STATUS_CLASS[alert.status]}`}>
        {STATUS_LABEL[alert.status]}
      </span>
    </motion.div>
  )
}
