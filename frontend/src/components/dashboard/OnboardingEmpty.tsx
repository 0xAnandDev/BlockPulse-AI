import { motion } from 'motion/react'
import { Plus, Radar, ShieldCheck, Zap } from 'lucide-react'
import Button from '../ui/Button'

const FEATURES = [
  { icon: Radar, text: 'Continuous on-chain monitoring, no manual refresh' },
  { icon: Zap, text: 'Instant alerts the moment something looks off' },
  { icon: ShieldCheck, text: 'Plain-English AI explanations, not raw tx hashes' },
]

export default function OnboardingEmpty({ onAddWallet }: { onAddWallet: () => void }) {
  return (
    <div className="flex min-h-[calc(100vh-140px)] w-full items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="panel relative flex max-w-lg flex-col items-center overflow-hidden rounded-[2rem] px-8 py-16 text-center sm:px-14"
      >
        <div className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--indigo)] opacity-[0.14] blur-[100px]" />
        </div>

        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)]"
        >
          <ShieldCheck className="h-9 w-9 text-[var(--cyan)]" aria-hidden="true" />
          <span className="absolute inset-0 rounded-full border border-[var(--cyan)] opacity-30 animate-ping" />
        </motion.div>

        <h1 className="display-title relative z-10 mt-7 text-3xl font-bold text-[var(--ink)]">
          Let&apos;s protect your first wallet.
        </h1>
        <p className="relative z-10 mt-3 max-w-sm text-sm text-[var(--ink-soft)]">
          BlockPulse AI continuously watches blockchain activity and immediately alerts you when
          something unusual happens.
        </p>

        <Button onClick={onAddWallet} className="relative z-10 mt-8 w-auto px-8">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Wallet
        </Button>

        <ul className="relative z-10 mt-10 flex w-full flex-col gap-3 border-t border-[var(--line)] pt-8 text-left">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-[var(--ink-soft)]">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </motion.div>
    </div>
  )
}
