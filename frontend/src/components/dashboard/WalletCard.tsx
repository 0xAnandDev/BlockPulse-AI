import { motion } from 'motion/react'
import { Eye, Pause, Play, Trash2 } from 'lucide-react'
import RiskBadge from './RiskBadge'
import type { Wallet } from '../../lib/dashboard/types'

function shortenAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export interface WalletCardProps {
  wallet: Wallet
  onToggleMonitoring: (id: string) => void
  onDelete: (id: string) => void
}

export default function WalletCard({ wallet, onToggleMonitoring, onDelete }: WalletCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="panel flex flex-col gap-4 rounded-2xl p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-[var(--ink)]">{wallet.name}</p>
          {wallet.ensName && <p className="text-xs text-[var(--cyan)]">{wallet.ensName}</p>}
          <p className="mono mt-0.5 text-xs text-[var(--ink-faint)]">{shortenAddress(wallet.address)}</p>
        </div>
        <span className="pill flex-shrink-0">{wallet.network}</span>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-[var(--ink-soft)]">
          <span
            className={`h-1.5 w-1.5 rounded-full ${wallet.monitoring ? 'bg-[var(--risk-low)]' : 'bg-[var(--ink-faint)]'}`}
          />
          {wallet.monitoring ? 'Monitoring active' : 'Monitoring paused'}
        </span>
        <span className="text-[var(--ink-faint)]">Last activity: {wallet.lastActivity}</span>
      </div>

      <div className="flex items-center justify-between border-t border-[var(--line)] pt-4">
        <RiskBadge risk={wallet.riskScore} />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="View wallet"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-white/8 hover:text-[var(--ink)]"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            title={wallet.monitoring ? 'Pause monitoring' : 'Resume monitoring'}
            onClick={() => onToggleMonitoring(wallet.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-white/8 hover:text-[var(--ink)]"
          >
            {wallet.monitoring ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            title="Delete wallet"
            onClick={() => onDelete(wallet.id)}
            className="flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-white/8 hover:text-[var(--risk-high)]"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
