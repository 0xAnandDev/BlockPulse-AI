import { Cpu, RefreshCw, ShieldCheck, Wallet } from 'lucide-react'

export interface ProtectionStatusBarProps {
  walletsProtected: number
  monitoringCount: number
}

export default function ProtectionStatusBar({ walletsProtected, monitoringCount }: ProtectionStatusBarProps) {
  const isMonitoringActive = monitoringCount > 0

  return (
    <div className="panel flex flex-wrap items-center gap-x-8 gap-y-4 rounded-2xl px-6 py-4">
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          {isMonitoringActive && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--risk-low)] opacity-60" />
          )}
          <span
            className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isMonitoringActive ? 'bg-[var(--risk-low)]' : 'bg-[var(--ink-faint)]'}`}
          />
        </span>
        <span className="text-sm font-semibold text-[var(--ink)]">
          {isMonitoringActive ? `Monitoring Active (${monitoringCount})` : 'Monitoring Paused'}
        </span>
      </div>

      <span className="hidden h-6 w-px bg-[var(--line)] sm:block" aria-hidden="true" />

      <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
        <Wallet className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
        Wallets Protected <span className="font-semibold text-[var(--ink)]">{walletsProtected}</span>
      </div>

      <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
        <Cpu className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
        AI Engine <span className="font-semibold text-[var(--risk-low)]">Online</span>
      </div>

      <div className="ml-auto flex items-center gap-2 text-sm text-[var(--ink-soft)]">
        <RefreshCw className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
        Last Sync <span className="font-semibold text-[var(--ink)]">Just now</span>
      </div>

      <ShieldCheck className="hidden h-5 w-5 text-[var(--cyan)] sm:block" aria-hidden="true" />
    </div>
  )
}
