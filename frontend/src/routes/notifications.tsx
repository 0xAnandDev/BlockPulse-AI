import { createFileRoute } from '@tanstack/react-router'
import { Bell, Check, Clock, Mail, MessageCircle, Send } from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import { NOTIFICATION_CHANNELS, NOTIFICATION_HISTORY } from '../lib/mock/notifications'

export const Route = createFileRoute('/notifications')({ component: NotificationsRoute })

const CHANNEL_ICON: Record<string, typeof Mail> = {
  email: Mail,
  telegram: Send,
  discord: MessageCircle,
}

function NotificationsRoute() {
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
          {NOTIFICATION_CHANNELS.map((channel) => {
            const Icon = CHANNEL_ICON[channel.id]
            return (
              <div key={channel.id} className="flex items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <p className="font-medium text-[var(--ink)]">{channel.name}</p>
                </div>
                {channel.status === 'connected' ? (
                  <span className="pill severity-low">
                    <Check className="h-3 w-3" aria-hidden="true" />
                    Connected
                  </span>
                ) : (
                  <span className="pill">Coming soon</span>
                )}
              </div>
            )
          })}
        </div>

        <div className="panel rounded-2xl p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
            <p className="kicker">History</p>
          </div>
          <ul className="mt-4 flex flex-col gap-3">
            {NOTIFICATION_HISTORY.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p className="text-[var(--ink)]">{item.title}</p>
                  <p className="text-xs text-[var(--ink-faint)]">{item.channel}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-[var(--ink-faint)]">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AppShell>
  )
}
