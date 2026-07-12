import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { Plus, Wallet as WalletIcon } from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import WalletCard from '../components/dashboard/WalletCard'
import AddWalletModal from '../components/dashboard/AddWalletModal'
import Button from '../components/ui/Button'
import Skeleton from '../components/ui/Skeleton'
import { WalletsProvider, useWallets } from '../lib/dashboard/store'

export const Route = createFileRoute('/wallets')({ component: WalletsRoute })

function WalletsRoute() {
  return (
    <WalletsProvider>
      <AppShell>
        <WalletsContent />
      </AppShell>
    </WalletsProvider>
  )
}

function WalletsContent() {
  const { wallets, isLoading, error, toggleMonitoring, removeWallet } = useWallets()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="kicker mb-1">Wallets</p>
          <h1 className="display-title text-2xl font-bold text-[var(--ink)]">Protected wallets</h1>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-auto px-5">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add Wallet
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
          <p className="font-semibold text-[var(--ink)]">Couldn&apos;t load your wallets</p>
          <p className="max-w-sm text-sm text-[var(--ink-soft)]">{error}</p>
        </div>
      ) : wallets.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 rounded-2xl px-6 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[var(--cyan)]">
            <WalletIcon className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="font-semibold text-[var(--ink)]">No wallets yet</p>
          <p className="max-w-sm text-sm text-[var(--ink-soft)]">
            Add a wallet to start continuous, AI-powered monitoring.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {wallets.map((wallet) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                onToggleMonitoring={toggleMonitoring}
                onDelete={removeWallet}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      <AddWalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
