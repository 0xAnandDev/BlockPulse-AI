import { motion } from 'motion/react'
import { Sparkles } from 'lucide-react'
import { AI_SECURITY_FEED } from '../../lib/mock/aiFeed'
import RiskBadge from './RiskBadge'

export default function AiSecurityFeed() {
  return (
    <div className="panel rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--cyan)]" aria-hidden="true" />
        <p className="kicker">AI security feed</p>
      </div>
      <h2 className="display-title mt-1 text-lg font-bold text-[var(--ink)]">Live insights</h2>

      <ul className="mt-5 flex flex-col gap-3">
        {AI_SECURITY_FEED.map((item, i) => (
          <motion.li
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <RiskBadge risk={item.risk} />
              <span className="text-[11px] text-[var(--ink-faint)]">{item.time}</span>
            </div>
            <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">{item.text}</p>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}
