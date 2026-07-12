import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Bell,
  Calendar,
  Check,
  Copy,
  Fingerprint,
  Mail,
  Pencil,
  Settings as SettingsIcon,
  ShieldCheck,
  User as UserIcon,
  Wallet as WalletIcon,
} from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import RiskBadge from '../components/dashboard/RiskBadge'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { getCachedUser, loadCurrentUser } from '../lib/api/currentUser'
import type { AuthUser } from '../lib/api/auth'
import { getDashboardSummary } from '../lib/api/dashboard'
import type { DashboardSummary } from '../lib/dashboard/types'

export const Route = createFileRoute('/profile')({ component: ProfileRoute })

function ProfileRoute() {
  return (
    <AppShell>
      <ProfileContent />
    </AppShell>
  )
}

const QUICK_ACTIONS = [
  { label: 'My Wallets', description: 'View and manage protected wallets', to: '/wallets', icon: WalletIcon },
  { label: 'Notifications', description: 'Email and Telegram delivery history', to: '/notifications', icon: Bell },
  { label: 'Settings', description: 'Update account and alert preferences', to: '/settings', icon: SettingsIcon },
] as const

function ProfileContent() {
  const [user, setUser] = useState<AuthUser | null>(getCachedUser())
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (user) return
    let cancelled = false
    loadCurrentUser()
      .then((u) => {
        if (!cancelled) setUser(u)
      })
      .catch(() => {
        if (!cancelled) setError('Could not load your profile.')
      })
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let cancelled = false
    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch(() => {
        // protection overview is supplementary — the profile page still works without it
      })
    return () => {
      cancelled = true
    }
  }, [])

  const initial = user?.fullName.trim().charAt(0).toUpperCase() || 'U'

  const handleCopyId = () => {
    if (!user) return
    navigator.clipboard.writeText(user.id).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <p className="kicker mb-1">Account</p>
        <h1 className="display-title text-2xl font-bold text-[var(--ink)]">My Profile</h1>
      </div>

      {error ? (
        <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
          <p className="font-semibold text-[var(--ink)]">Couldn&apos;t load your profile</p>
          <p className="max-w-sm text-sm text-[var(--ink-soft)]">{error}</p>
        </div>
      ) : !user ? (
        <div className="flex flex-col gap-6">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid gap-6 lg:grid-cols-3">
            <Skeleton className="h-64 w-full rounded-2xl lg:col-span-2" />
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Cover + identity header */}
          <div className="panel overflow-hidden rounded-2xl">
            <div className="h-20 bg-[linear-gradient(120deg,rgba(99,102,241,0.35),rgba(34,211,238,0.22))]" />
            <div className="flex flex-wrap items-end justify-between gap-4 px-6 pb-6">
              <div className="flex items-end gap-4">
                <div className="-mt-10 flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--indigo),var(--cyan))] text-2xl font-bold text-white ring-4 ring-[var(--bg-elevated)]">
                  {initial}
                </div>
                <div className="pb-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-lg font-bold text-[var(--ink)]">{user.fullName}</p>
                    <span className="pill severity-low">
                      <ShieldCheck className="h-3 w-3" aria-hidden="true" />
                      Active
                    </span>
                    <span className="pill">{user.role}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--ink-faint)]">{user.email}</p>
                </div>
              </div>

              <Link to="/settings" className="no-underline">
                <Button variant="secondary" className="w-auto px-5">
                  <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                  Edit Profile
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            {/* Account details */}
            <div className="panel rounded-2xl p-6 lg:col-span-2">
              <p className="kicker mb-1">Details</p>
              <h2 className="display-title mb-4 text-lg font-bold text-[var(--ink)]">Account details</h2>

              <dl className="flex flex-col divide-y divide-[var(--line)]">
                <DetailRow icon={UserIcon} label="Full name" value={user.fullName} />
                <DetailRow icon={Mail} label="Email address" value={user.email} />
                <DetailRow
                  icon={Fingerprint}
                  label="Account ID"
                  value={<span className="mono">{user.id}</span>}
                  action={
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="flex items-center gap-1.5 rounded-full border border-[var(--line-strong)] bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--ink-soft)] transition hover:border-[var(--cyan)] hover:text-[var(--ink)]"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-[var(--risk-low)]" aria-hidden="true" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                          Copy
                        </>
                      )}
                    </button>
                  }
                />
                <DetailRow
                  icon={Calendar}
                  label="Member since"
                  value={new Date(user.createdAt).toLocaleDateString(undefined, {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                />
              </dl>
            </div>

            {/* Sidebar: quick actions + protection overview */}
            <div className="flex flex-col gap-6">
              <div className="panel rounded-2xl p-2">
                {QUICK_ACTIONS.map((action) => (
                  <Link
                    key={action.to}
                    to={action.to}
                    className="flex items-center gap-3 rounded-xl px-3.5 py-3 no-underline transition hover:bg-white/8"
                  >
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
                      <action.icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--ink)]">{action.label}</p>
                      <p className="truncate text-xs text-[var(--ink-faint)]">{action.description}</p>
                    </span>
                  </Link>
                ))}
              </div>

              {summary && (
                <div className="panel rounded-2xl p-5">
                  <p className="kicker mb-1">Protection</p>
                  <h2 className="display-title mb-4 text-base font-bold text-[var(--ink)]">Your coverage</h2>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-soft)]">Current risk</span>
                    <RiskBadge risk={summary.currentRisk} />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-soft)]">Wallets protected</span>
                    <span className="font-semibold text-[var(--ink)]">{summary.walletsProtected}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-soft)]">Active monitoring</span>
                    <span className="font-semibold text-[var(--ink)]">{summary.activeMonitoring}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-[var(--ink-soft)]">AI confidence</span>
                    <span className="font-semibold text-[var(--ink)]">{summary.aiConfidence}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  action,
}: {
  icon: typeof UserIcon
  label: string
  value: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 flex-shrink-0 text-[var(--ink-faint)]" aria-hidden="true" />
        <div>
          <p className="text-xs text-[var(--ink-faint)]">{label}</p>
          <p className="text-sm font-medium text-[var(--ink)]">{value}</p>
        </div>
      </div>
      {action}
    </div>
  )
}
