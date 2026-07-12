import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import AppShell from '../components/dashboard/AppShell'
import OnboardingEmpty from '../components/dashboard/OnboardingEmpty'
import AddWalletModal from '../components/dashboard/AddWalletModal'
import ProtectionStatusBar from '../components/dashboard/ProtectionStatusBar'
import WalletHealthTimeline from '../components/dashboard/WalletHealthTimeline'
import ProtectionOverview from '../components/dashboard/ProtectionOverview'
import ActivityChart from '../components/dashboard/ActivityChart'
import AiSecurityFeed from '../components/dashboard/AiSecurityFeed'
import { WalletsProvider, useWallets } from '../lib/dashboard/store'
import { getDashboardSummary } from '../lib/api/dashboard'
import { ApiError } from '../lib/api/client'
import type { DashboardSummary } from '../lib/dashboard/types'
import Skeleton from '../components/ui/Skeleton'

export const Route = createFileRoute('/dashboard')({ component: DashboardRoute })

function DashboardRoute() {
  return (
    <WalletsProvider>
      <AppShell>
        <DashboardContent />
      </AppShell>
    </WalletsProvider>
  )
}

function DashboardContent() {
  const { wallets, isLoading, error } = useWallets()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [summaryError, setSummaryError] = useState<string | null>(null)

  useEffect(() => {
    if (wallets.length === 0) return
    let cancelled = false

    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((err) => {
        if (!cancelled) setSummaryError(err instanceof ApiError ? err.message : 'Could not load dashboard data.')
      })

    return () => {
      cancelled = true
    }
  }, [wallets.length])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
        <p className="font-semibold text-[var(--ink)]">Couldn&apos;t load your wallets</p>
        <p className="max-w-sm text-sm text-[var(--ink-soft)]">{error}</p>
      </div>
    )
  }

  if (wallets.length === 0) {
    return (
      <>
        <OnboardingEmpty onAddWallet={() => setIsModalOpen(true)} />
        <AddWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  if (summaryError) {
    return (
      <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
        <p className="font-semibold text-[var(--ink)]">Couldn&apos;t load dashboard data</p>
        <p className="max-w-sm text-sm text-[var(--ink-soft)]">{summaryError}</p>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-16 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ProtectionStatusBar walletsProtected={summary.walletsProtected} monitoringCount={summary.activeMonitoring} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-start">
        <WalletHealthTimeline events={summary.timeline} />
        <div className="flex flex-col gap-6">
          <ProtectionOverview currentRisk={summary.currentRisk} aiConfidence={summary.aiConfidence} />
          <ActivityChart data={summary.activityGraph} />
        </div>
        <AiSecurityFeed insights={summary.latestInsights} />
      </div>

      <AddWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
