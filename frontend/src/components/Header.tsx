import { Link } from '@tanstack/react-router'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(5,7,13,0.72)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <Link
          to="/"
          className="inline-flex flex-shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-[var(--ink)] no-underline"
        >
          <span className="pulse-dot h-2 w-2 rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--cyan))]" />
          <span className="font-display">BlockPulse AI</span>
        </Link>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-6 gap-y-1 pb-1 text-sm sm:order-none sm:w-auto sm:flex-nowrap sm:pb-0">
          <a href="#pipeline" className="nav-link">
            Pipeline
          </a>
          <a href="#detection" className="nav-link">
            Detection
          </a>
          <a href="#stack" className="nav-link">
            Tech Stack
          </a>
          <a
            href="https://github.com/0xAnandDev/BlockPulse-AI"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
          >
            GitHub
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <a
            href="#pipeline"
            className="rounded-full border border-[var(--chip-line)] bg-[linear-gradient(90deg,rgba(99,102,241,0.9),rgba(34,211,238,0.9))] px-4 py-2 text-sm font-semibold text-white no-underline shadow-[0_8px_24px_rgba(99,102,241,0.25)] transition hover:-translate-y-0.5"
          >
            See it in action
          </a>
        </div>
      </nav>
    </header>
  )
}
