import { createFileRoute } from '@tanstack/react-router'
import AppShell from '../components/dashboard/AppShell'
import AlertCard from '../components/dashboard/AlertCard'
import { ALERTS } from '../lib/mock/alerts'

export const Route = createFileRoute('/alerts')({ component: AlertsRoute })

function AlertsRoute() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <div>
          <p className="kicker mb-1">Alert center</p>
          <h1 className="display-title text-2xl font-bold text-[var(--ink)]">Recent alerts</h1>
          <p className="mt-1 text-sm text-[var(--ink-soft)]">
            Every detection across your protected wallets, most recent first.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {ALERTS.map((alert, i) => (
            <AlertCard key={alert.id} alert={alert} index={i} />
          ))}
        </div>
      </div>
    </AppShell>
  )
}
