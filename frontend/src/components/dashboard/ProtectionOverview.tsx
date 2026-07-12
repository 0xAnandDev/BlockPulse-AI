import { motion } from 'motion/react'
import { ShieldCheck } from 'lucide-react'

export default function ProtectionOverview() {
  return (
    <div className="panel rounded-2xl p-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto flex h-24 w-24 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-[var(--risk-low)] opacity-[0.12] blur-xl" />
        <span className="absolute inset-2 rounded-full border border-[rgba(34,197,94,0.3)]" />
        <ShieldCheck className="relative h-12 w-12 text-[var(--risk-low)]" aria-hidden="true" />
      </motion.div>

      <p className="mt-5 text-base font-semibold text-[var(--ink)]">
        Your assets are currently protected.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-4 py-3.5">
          <p className="kicker mb-1.5">Current risk</p>
          <p className="text-xl font-bold text-[var(--risk-low)]">LOW</p>
        </div>
        <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-4 py-3.5">
          <p className="kicker mb-1.5">AI confidence</p>
          <p className="text-xl font-bold text-[var(--ink)]">98%</p>
        </div>
      </div>
    </div>
  )
}
