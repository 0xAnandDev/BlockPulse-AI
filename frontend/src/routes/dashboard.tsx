import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import AppShell from '../components/dashboard/AppShell'
import OnboardingEmpty from '../components/dashboard/OnboardingEmpty'
import AddWalletModal from '../components/dashboard/AddWalletModal'
import ProtectionStatusBar from '../components/dashboard/ProtectionStatusBar'
import WalletHealthTimeline from '../components/dashboard/WalletHealthTimeline'
import ProtectionOverview from '../components/dashboard/ProtectionOverview'
import ActivityChart from '../components/dashboard/ActivityChart'
import AiSecurityFeed from '../components/dashboard/AiSecurityFeed'
import { WalletsProvider, useWallets } from '../lib/dashboard/store'
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
  const { wallets, isLoading } = useWallets()
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  if (wallets.length === 0) {
    return (
      <>
        <OnboardingEmpty onAddWallet={() => setIsModalOpen(true)} />
        <AddWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <ProtectionStatusBar walletsProtected={wallets.length} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr_1fr] lg:items-start">
        <WalletHealthTimeline />
        <div className="flex flex-col gap-6">
          <ProtectionOverview />
          <ActivityChart />
        </div>
        <AiSecurityFeed />
      </div>

      <AddWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
