import { motion } from 'motion/react'
import type { RiskLevel, TimelineEvent } from '../../lib/dashboard/types'

const DOT_COLOR: Record<RiskLevel, string> = {
  low: 'bg-[var(--risk-low)]',
  medium: 'bg-[var(--risk-medium)]',
  high: 'bg-[var(--risk-high)]',
  critical: 'bg-[var(--risk-critical)]',
}

export interface WalletHealthTimelineProps {
  events: Array<TimelineEvent>
}

export default function WalletHealthTimeline({ events }: WalletHealthTimelineProps) {
  return (
    <div className="panel rounded-2xl p-5">
      <p className="kicker mb-1">Live activity</p>
      <h2 className="display-title text-lg font-bold text-[var(--ink)]">Wallet Health Timeline</h2>

      {events.length === 0 ? (
        <p className="mt-5 text-sm text-[var(--ink-soft)]">
          No on-chain activity detected yet. New events will appear here as they happen.
        </p>
      ) : (
        <ol className="mt-5 flex flex-col gap-5">
          {events.map((event, i) => (
            <motion.li
              key={event.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05 }}
              className="relative flex gap-3 pl-1"
            >
              <div className="flex flex-col items-center">
                <span className={`mt-1.5 h-2.5 w-2.5 flex-shrink-0 rounded-full ${DOT_COLOR[event.risk]}`} />
                {i < events.length - 1 && <span className="mt-1 w-px flex-1 bg-[var(--line)]" />}
              </div>
              <div className="pb-1">
                <p className="mono text-xs text-[var(--ink-faint)]">{event.time}</p>
                <p className="mt-0.5 text-sm font-semibold text-[var(--ink)]">{event.title}</p>
                <p className="mt-0.5 text-xs text-[var(--ink-soft)]">{event.detail}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      )}
    </div>
  )
}
