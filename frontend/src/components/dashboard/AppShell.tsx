import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { Bell, LayoutDashboard, LogOut, Settings, ShieldAlert, Sparkles, Wallet } from 'lucide-react'
import { logoutUser } from '../../lib/api/auth'
import { clearAccessToken } from '../../lib/api/tokenStore'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Wallets', to: '/wallets', icon: Wallet },
  { label: 'Alerts', to: '/alerts', icon: ShieldAlert },
  { label: 'AI Insights', to: '/ai-insights', icon: Sparkles },
] as const

export default function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // best-effort: still clear the local session below
    }
    clearAccessToken()
    navigate({ to: '/' })
  }

  return (
    <div className="min-h-screen w-full">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[rgba(5,7,13,0.72)] px-4 backdrop-blur-lg">
        <nav className="page-wrap flex items-center gap-x-3 gap-y-2 py-3">
          <Link
            to="/dashboard"
            className="mr-2 inline-flex flex-shrink-0 items-center gap-2 text-base font-semibold tracking-tight text-[var(--ink)] no-underline"
          >
            <span className="pulse-dot h-2 w-2 rounded-full bg-[linear-gradient(90deg,var(--indigo),var(--cyan))]" />
            <span className="font-display">BlockPulse AI</span>
          </Link>

          <div className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.to
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium no-underline transition ${
                    isActive
                      ? 'bg-white/8 text-[var(--ink)]'
                      : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
                  }`}
                >
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              )
            })}
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <Link
              to="/notifications"
              aria-label="Notifications"
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-white/8 hover:text-[var(--ink)] ${
                pathname === '/notifications' ? 'bg-white/8 text-[var(--ink)]' : ''
              }`}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
            </Link>
            <Link
              to="/settings"
              aria-label="Settings"
              className={`flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-white/8 hover:text-[var(--ink)] ${
                pathname === '/settings' ? 'bg-white/8 text-[var(--ink)]' : ''
              }`}
            >
              <Settings className="h-4 w-4" aria-hidden="true" />
            </Link>
            <span className="mx-1 h-6 w-px bg-[var(--line)]" aria-hidden="true" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--indigo),var(--cyan))] text-xs font-bold text-white">
              U
            </div>
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Log out"
              title="Log out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--ink-soft)] transition hover:bg-white/8 hover:text-[var(--risk-high)]"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>

        <div className="page-wrap flex items-center gap-4 overflow-x-auto pb-2.5 text-xs sm:hidden">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`nav-link flex-shrink-0 ${pathname === item.to ? 'is-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="page-wrap px-4 py-8">{children}</main>
    </div>
  )
}
