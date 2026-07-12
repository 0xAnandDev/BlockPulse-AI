import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { Bell, Check, Clock, Mail, Send, X } from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import Skeleton from '../components/ui/Skeleton'
import { getNotifications } from '../lib/api/notifications'
import { ApiError } from '../lib/api/client'
import type { NotificationItem } from '../lib/dashboard/types'

export const Route = createFileRoute('/notifications')({ component: NotificationsRoute })

const CHANNELS = [
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'telegram', name: 'Telegram', icon: Send },
] as const

const STATUS_ICON: Record<NotificationItem['status'], typeof Check> = {
  sent: Check,
  pending: Clock,
  failed: X,
}

const STATUS_CLASS: Record<NotificationItem['status'], string> = {
  sent: 'severity-low',
  pending: '',
  failed: 'severity-high',
}

function NotificationsRoute() {
  const [notifications, setNotifications] = useState<Array<NotificationItem> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getNotifications()
      .then((data) => {
        if (!cancelled) setNotifications(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load notifications.')
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <AppShell>
      <div className="mx-auto flex max-w-lg flex-col gap-6">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-[var(--cyan)]" aria-hidden="true" />
          <div>
            <p className="kicker mb-0.5">Notification center</p>
            <h1 className="display-title text-xl font-bold text-[var(--ink)]">Delivery channels</h1>
          </div>
        </div>

        <div className="panel flex flex-col divide-y divide-[var(--line)] rounded-2xl">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon
            return (
              <div key={channel.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="font-medium text-[var(--ink)]">{channel.name}</p>
                </div>
                <span className="pill severity-low">
                  <Check className="h-3 w-3" aria-hidden="true" />
                  Active
                </span>
              </div>
            )
          })}
        </div>
        <p className="-mt-3 text-xs text-[var(--ink-faint)]">
          High and Critical alerts are dispatched automatically over both channels.
        </p>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
            <p className="kicker">History</p>
          </div>

          {error ? (
            <p className="mt-4 text-sm text-[var(--ink-soft)]">{error}</p>
          ) : !notifications ? (
            <div className="mt-4 flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="mt-4 text-sm text-[var(--ink-soft)]">
              No notifications yet — you&apos;ll see High and Critical alert deliveries here.
            </p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {notifications.map((item) => {
                const StatusIcon = STATUS_ICON[item.status]
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate text-[var(--ink)]">{item.title}</p>
                      <p className="text-xs text-[var(--ink-faint)]">
                        {item.walletName} &middot; {item.channel}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className={`pill ${STATUS_CLASS[item.status]}`}>
                        <StatusIcon className="h-3 w-3" aria-hidden="true" />
                        {item.status}
                      </span>
                      <span className="text-xs text-[var(--ink-faint)]">{item.time}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </AppShell>
  )
}
