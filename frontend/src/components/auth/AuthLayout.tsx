import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { ShieldCheck, Sparkles, Zap } from 'lucide-react'

const HIGHLIGHTS = [
  { icon: Zap, text: 'Real-time wallet & contract monitoring' },
  { icon: ShieldCheck, text: 'Four risk detectors watching every event' },
  { icon: Sparkles, text: 'AI-generated, plain-English insights' },
]

export interface AuthLayoutProps {
  eyebrow: string
  title: string
  subtitle: string
  children: ReactNode
  footer: ReactNode
}

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-[calc(100vh-64px)] w-full items-center justify-center overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-[8%] top-[-10%] h-[420px] w-[420px] rounded-full bg-[var(--indigo)] opacity-20 blur-[120px]" />
        <div className="absolute right-[6%] bottom-[-15%] h-[420px] w-[420px] rounded-full bg-[var(--cyan)] opacity-15 blur-[120px]" />
      </div>

      <div className="page-wrap relative z-10 grid w-full max-w-5xl gap-0 overflow-hidden rounded-[2rem] border border-[var(--line)] shadow-[0_30px_80px_rgba(0,0,0,0.45)] lg:grid-cols-[1.05fr_1fr]">
        <motion.aside
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--line)] bg-[linear-gradient(165deg,rgba(99,102,241,0.16),rgba(10,14,24,0.9))] p-10 lg:flex"
        >
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-base font-semibold tracking-tight text-[var(--ink)] no-underline"
          >
            <span className="pulse-dot h-2 w-2 rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--cyan))]" />
            <span className="font-display">BlockPulse AI</span>
          </Link>

          <div>
            <p className="display-title text-3xl font-bold leading-tight text-[var(--ink)]">
              Know the moment your crypto is at risk.
            </p>
            <ul className="mt-8 flex flex-col gap-4">
              {HIGHLIGHTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-sm text-[var(--ink-soft)]">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-[var(--ink-faint)]">
            Trusted by teams who need to know what happened to their assets before they have to ask.
          </p>
        </motion.aside>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
          className="panel flex flex-col justify-center rounded-none px-6 py-10 sm:px-10 sm:py-12 lg:rounded-none"
        >
          <p className="kicker mb-2">{eyebrow}</p>
          <h1 className="display-title text-2xl font-bold text-[var(--ink)] sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-[var(--ink-soft)]">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-6 text-center text-sm text-[var(--ink-soft)]">{footer}</div>
        </motion.section>
      </div>
    </main>
  )
}
