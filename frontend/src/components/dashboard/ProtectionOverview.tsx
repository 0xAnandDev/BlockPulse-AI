import { motion } from 'motion/react'
import { ShieldAlert, ShieldCheck } from 'lucide-react'
import type { RiskLevel } from '../../lib/dashboard/types'

const RISK_DISPLAY: Record<RiskLevel, { label: string; color: string; borderColor: string; icon: typeof ShieldCheck }> = {
  low: { label: 'LOW', color: 'var(--risk-low)', borderColor: 'rgba(34,197,94,0.3)', icon: ShieldCheck },
  medium: { label: 'MEDIUM', color: 'var(--risk-medium)', borderColor: 'rgba(245,158,11,0.3)', icon: ShieldAlert },
  high: { label: 'HIGH', color: 'var(--risk-high)', borderColor: 'rgba(244,63,94,0.3)', icon: ShieldAlert },
  critical: { label: 'CRITICAL', color: 'var(--risk-critical)', borderColor: 'rgba(220,38,38,0.4)', icon: ShieldAlert },
}

const STATUS_TEXT: Record<RiskLevel, string> = {
  low: 'Your assets are currently protected.',
  medium: 'Minor risk detected — review your recent alerts.',
  high: 'Elevated risk detected — review your recent alerts.',
  critical: 'Critical risk detected — immediate review recommended.',
}

export interface ProtectionOverviewProps {
  currentRisk: RiskLevel
  aiConfidence: number
}

export default function ProtectionOverview({ currentRisk, aiConfidence }: ProtectionOverviewProps) {
  const { label, color, borderColor, icon: Icon } = RISK_DISPLAY[currentRisk]

  return (
    <div className="panel rounded-2xl p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex h-24 w-24 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full opacity-[0.12] blur-xl" style={{ backgroundColor: color }} />
        <span className="absolute inset-2 rounded-full border" style={{ borderColor }} />
        <Icon className="relative h-12 w-12" style={{ color }} aria-hidden="true" />
      </motion.div>

      <p className="mt-5 text-base font-semibold text-[var(--ink)]">{STATUS_TEXT[currentRisk]}</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-4 py-3.5">
          <p className="kicker mb-1.5">Current risk</p>
          <p className="text-xl font-bold" style={{ color }}>
            {label}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-4 py-3.5">
          <p className="kicker mb-1.5">AI confidence</p>
          <p className="text-xl font-bold text-[var(--ink)]">{aiConfidence}%</p>
        </div>
      </div>
    </div>
  )
}
