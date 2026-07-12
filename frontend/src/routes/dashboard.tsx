import { createFileRoute, Link } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'

export const Route = createFileRoute('/dashboard')({ component: DashboardPage })

function DashboardPage() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center px-4 py-16">
      <div className="panel rise-in flex max-w-md flex-col items-center gap-4 rounded-[2rem] px-8 py-14 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
          <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="display-title text-2xl font-bold text-[var(--ink)]">You&apos;re in.</h1>
        <p className="text-sm text-[var(--ink-soft)]">
          The monitoring dashboard is under construction. Wallet tracking, live detections, and AI
          insights are coming next.
        </p>
        <Link
          to="/"
          className="mt-2 rounded-full border border-[var(--line-strong)] bg-white/5 px-5 py-2.5 text-sm font-semibold text-[var(--ink)] no-underline transition hover:-translate-y-0.5 hover:border-[var(--cyan)]"
        >
          Back to home
        </Link>
      </div>
    </main>
  )
}
