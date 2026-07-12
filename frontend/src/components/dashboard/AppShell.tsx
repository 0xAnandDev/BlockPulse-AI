import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Bell, LayoutDashboard, LogOut, Settings, ShieldAlert, Sparkles, User as UserIcon, Wallet } from 'lucide-react'
import { logoutUser } from '../../lib/api/auth'
import type { AuthUser } from '../../lib/api/auth'
import { clearAccessToken } from '../../lib/api/tokenStore'
import { clearCachedUser, getCachedUser, loadCurrentUser } from '../../lib/api/currentUser'

const NAV_ITEMS = [
  { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Wallets', to: '/wallets', icon: Wallet },
  { label: 'Alerts', to: '/alerts', icon: ShieldAlert },
  { label: 'AI Insights', to: '/ai-insights', icon: Sparkles },
] as const

export default function AppShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  const [user, setUser] = useState<AuthUser | null>(getCachedUser())
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (user) return
    let cancelled = false
    loadCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!isMenuOpen) return
    const handlePointerDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setIsMenuOpen(false)
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMenuOpen])

  const initial = user?.fullName.trim().charAt(0).toUpperCase() || 'U'

  const handleLogout = async () => {
    try {
      await logoutUser()
    } catch {
      // best-effort: still clear the local session below
    }
    clearCachedUser()
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

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-label="Account menu"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--indigo),var(--cyan))] text-xs font-bold text-white transition hover:brightness-110"
              >
                {initial}
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    role="menu"
                    className="panel absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl p-1.5"
                  >
                    <div className="flex items-center gap-3 px-3 py-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--indigo),var(--cyan))] text-sm font-bold text-white">
                        {initial}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[var(--ink)]">
                          {user?.fullName ?? 'Loading…'}
                        </p>
                        <p className="truncate text-xs text-[var(--ink-faint)]">{user?.email ?? ''}</p>
                      </div>
                    </div>

                    <div className="my-1 h-px bg-[var(--line)]" />

                    <Link
                      to="/profile"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--ink-soft)] no-underline transition hover:bg-white/8 hover:text-[var(--ink)]"
                    >
                      <UserIcon className="h-4 w-4" aria-hidden="true" />
                      My Profile
                    </Link>
                    <Link
                      to="/settings"
                      role="menuitem"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-[var(--ink-soft)] no-underline transition hover:bg-white/8 hover:text-[var(--ink)]"
                    >
                      <Settings className="h-4 w-4" aria-hidden="true" />
                      Settings
                    </Link>

                    <div className="my-1 h-px bg-[var(--line)]" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-[var(--ink-soft)] transition hover:bg-[rgba(244,63,94,0.14)] hover:text-[var(--risk-high)]"
                    >
                      <LogOut className="h-4 w-4" aria-hidden="true" />
                      Log out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
