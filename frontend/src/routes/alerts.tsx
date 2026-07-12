import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import AppShell from '../components/dashboard/AppShell'
import AlertCard from '../components/dashboard/AlertCard'
import Skeleton from '../components/ui/Skeleton'
import { getAlerts } from '../lib/api/alerts'
import { ApiError } from '../lib/api/client'
import type { AlertItem } from '../lib/dashboard/types'

export const Route = createFileRoute('/alerts')({ component: AlertsRoute })

function AlertsRoute() {
  const [alerts, setAlerts] = useState<Array<AlertItem> | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    getAlerts()
      .then((data) => {
        if (!cancelled) setAlerts(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load alerts.')
      })
    return () => {
      cancelled = true
    }
  }, [])

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

        {error ? (
          <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
            <p className="font-semibold text-[var(--ink)]">Couldn&apos;t load alerts</p>
            <p className="max-w-sm text-sm text-[var(--ink-soft)]">{error}</p>
          </div>
        ) : !alerts ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
            <p className="font-semibold text-[var(--ink)]">No alerts yet</p>
            <p className="max-w-sm text-sm text-[var(--ink-soft)]">
              BlockPulse AI hasn&apos;t detected anything unusual across your protected wallets.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {alerts.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
