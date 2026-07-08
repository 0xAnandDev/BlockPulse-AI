import { createFileRoute } from '@tanstack/react-router'
import LiquidEther from '../components/LiquidEther'

export const Route = createFileRoute('/')({ component: LandingPage })

const CURRENT_TOOLS = [
  { name: 'Etherscan', note: 'manually refresh to check tx history' },
  { name: 'Wallet apps', note: 'only show balances, not intent' },
  { name: 'Telegram bots', note: 'noisy, no plain-English context' },
  { name: 'Discord bots', note: 'scattered across a dozen servers' },
]

const PIPELINE_STEPS = [
  { title: 'Monitor', desc: 'Listens to tracked wallets & contracts in real time via on-chain event feeds.' },
  { title: 'Analyze', desc: 'Normalizes raw events into a consistent, structured shape.' },
  { title: 'Detect risks', desc: 'Runs events through rule-based detectors and assigns a severity.' },
  { title: 'Generate AI insight', desc: 'Claude turns the detected risk into a plain-English explanation.' },
  { title: 'Notify user', desc: 'Pushes the alert to you the moment it is generated.' },
  { title: 'Store in history', desc: 'Persists the event and insight to your security history.' },
]

const DETECTIONS = [
  {
    title: 'Large Transfer',
    severity: 'high' as const,
    desc: 'Flags outbound transfers far above a wallet’s normal activity.',
  },
  {
    title: 'Unlimited Approval',
    severity: 'high' as const,
    desc: 'Flags token approvals with no spending cap granted to a contract.',
  },
  {
    title: 'Contract Ownership Changed',
    severity: 'medium' as const,
    desc: 'Flags a change of `owner` on a monitored contract.',
  },
  {
    title: 'Whale Activity',
    severity: 'low' as const,
    desc: 'Flags large-holder movements that could signal market impact.',
  },
]

const STACK = [
  { layer: 'Frontend', items: ['TanStack Start', 'Tailwind CSS', 'shadcn/ui', 'Recharts', 'Zustand'] },
  { layer: 'Backend', items: ['NestJS', 'Prisma', 'PostgreSQL', 'Redis', 'BullMQ'] },
  { layer: 'Blockchain', items: ['Ethers.js', 'Alchemy Notify API', 'Polygon Amoy'] },
  { layer: 'AI', items: ['Claude API'] },
]

const severityClass: Record<'high' | 'medium' | 'low', string> = {
  high: 'severity-high',
  medium: 'severity-medium',
  low: 'severity-low',
}

function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="relative flex min-h-[92vh] w-full items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <LiquidEther
            colors={['#6366F1', '#22D3EE', '#A855F7']}
            mouseForce={18}
            cursorSize={110}
            isViscous={false}
            viscous={30}
            iterationsViscous={32}
            iterationsPoisson={32}
            resolution={0.5}
            isBounce={false}
            autoDemo={true}
            autoSpeed={0.45}
            autoIntensity={2}
            takeoverDuration={0.25}
            autoResumeDelay={2500}
            autoRampDuration={0.6}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_50%_38%,transparent_0%,var(--bg)_78%)]" />

        <div className="page-wrap relative z-10 rise-in flex flex-col items-center px-4 py-24 text-center">
          <span className="pill mb-6">
            <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
            Live on-chain monitoring &middot; Blockchain / AI track
          </span>
          <h1 className="display-title max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight text-[var(--ink)] sm:text-6xl">
            Know the moment your crypto is at risk.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-[var(--ink-soft)] sm:text-lg">
            BlockPulse AI watches your wallets and smart contracts around the clock, catches
            suspicious on-chain activity as it happens, and explains it in plain English &mdash;
            before you have to ask.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#pipeline"
              className="rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--cyan))] px-6 py-3 text-sm font-semibold text-white no-underline shadow-[0_12px_30px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5"
            >
              See how it works
            </a>
            <a
              href="#detection"
              className="rounded-full border border-[var(--line-strong)] bg-white/5 px-6 py-3 text-sm font-semibold text-[var(--ink)] no-underline transition hover:-translate-y-0.5 hover:border-[var(--cyan)]"
            >
              What it detects
            </a>
          </div>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-3 text-xs text-[var(--ink-faint)]">
            <span className="pill">4 real-time detectors</span>
            <span className="pill">AI-generated plain-English insights</span>
            <span className="pill">Instant notifications</span>
          </div>
        </div>
      </section>

      <div className="page-wrap px-4">
        {/* Problem */}
        <section className="mt-8 grid gap-6 py-16 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <p className="kicker mb-3">The problem</p>
            <h2 className="display-title text-3xl font-bold text-[var(--ink)] sm:text-4xl">
              One dashboard. No more tab-hopping.
            </h2>
            <p className="mt-4 max-w-lg text-[var(--ink-soft)]">
              Right now, knowing what happened to your assets means checking half a dozen
              disconnected tools by hand &mdash; and none of them tell you what it means or what
              to do next.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {CURRENT_TOOLS.map((tool) => (
              <div key={tool.name} className="panel rounded-2xl p-5">
                <p className="m-0 font-semibold text-[var(--ink)]">{tool.name}</p>
                <p className="m-0 mt-1.5 text-sm text-[var(--ink-soft)]">{tool.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline */}
        <section id="pipeline" className="scroll-mt-24 py-16">
          <p className="kicker mb-3 text-center">How it works</p>
          <h2 className="display-title text-center text-3xl font-bold text-[var(--ink)] sm:text-4xl">
            One continuous pipeline, from chain to notification
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.title} className="panel rise-in relative rounded-2xl p-5" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="mono text-xs text-[var(--ink-faint)]">
                  0{i + 1}
                </span>
                <p className="m-0 mt-2 font-semibold text-[var(--ink)]">{step.title}</p>
                <p className="m-0 mt-1.5 text-sm text-[var(--ink-soft)]">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Detection types */}
        <section id="detection" className="scroll-mt-24 py-16">
          <p className="kicker mb-3 text-center">Detection engine</p>
          <h2 className="display-title text-center text-3xl font-bold text-[var(--ink)] sm:text-4xl">
            Four risk signals, watched continuously
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DETECTIONS.map((d) => (
              <div key={d.title} className="panel rounded-2xl p-5">
                <span className={`pill ${severityClass[d.severity]}`}>{d.severity}</span>
                <p className="m-0 mt-4 font-semibold text-[var(--ink)]">{d.title}</p>
                <p className="m-0 mt-1.5 text-sm text-[var(--ink-soft)]">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AI insight example */}
        <section className="py-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="kicker mb-3">AI insight engine</p>
              <h2 className="display-title text-3xl font-bold text-[var(--ink)] sm:text-4xl">
                Not just an alert &mdash; an explanation.
              </h2>
              <p className="mt-4 max-w-lg text-[var(--ink-soft)]">
                Every detected event is sent to Claude for structured analysis, so you get a
                risk level, a plain-English reason, and a concrete recommendation &mdash; not just
                a raw transaction hash.
              </p>
            </div>
            <div className="panel rounded-2xl p-6">
              <div className="flex items-center gap-2">
                <span className="severity-high pill">high</span>
                <span className="mono text-xs text-[var(--ink-faint)]">tx 0x4a1f&hellip;9e02</span>
              </div>
              <p className="mono mt-4 text-sm leading-relaxed text-[var(--ink)]">
                <span className="text-[var(--ink-faint)]">Risk level:</span> High
                <br />
                <span className="text-[var(--ink-faint)]">Reason:</span> wallet transferred 420
                ETH to an address with no previous interaction history.
                <br />
                <span className="text-[var(--ink-faint)]">Recommendation:</span> verify whether
                this was intended; if not, revoke approvals immediately.
              </p>
            </div>
          </div>
        </section>

        {/* Tech stack */}
        <section id="stack" className="scroll-mt-24 py-16">
          <p className="kicker mb-3 text-center">Under the hood</p>
          <h2 className="display-title text-center text-3xl font-bold text-[var(--ink)] sm:text-4xl">
            Built to keep growing after the hackathon
          </h2>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STACK.map((group) => (
              <div key={group.layer} className="panel rounded-2xl p-5">
                <p className="kicker m-0 mb-3">{group.layer}</p>
                <ul className="m-0 list-none space-y-1.5 p-0 text-sm text-[var(--ink-soft)]">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="panel rise-in my-16 rounded-[2rem] px-6 py-14 text-center sm:px-12">
          <h2 className="display-title text-3xl font-bold text-[var(--ink)] sm:text-4xl">
            Stop checking five tabs to know what happened to your crypto.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--ink-soft)]">
            BlockPulse AI is being built live for HackHazards &apos;26. Follow along or star the
            repo to see the monitoring dashboard as it ships.
          </p>
          <a
            href="https://github.com/0xAnandDev/BlockPulse-AI"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--cyan))] px-6 py-3 text-sm font-semibold text-white no-underline shadow-[0_12px_30px_rgba(99,102,241,0.35)] transition hover:-translate-y-0.5"
          >
            View the repo on GitHub
          </a>
        </section>
      </div>
    </main>
  )
}
