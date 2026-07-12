import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createWallet, deleteWallet, getWallets, updateWallet } from '../api/wallets'
import { ApiError } from '../api/client'
import type { Network, Wallet } from './types'

interface WalletsContextValue {
  wallets: Array<Wallet>
  isLoading: boolean
  error: string | null
  addWallet: (input: { name: string; address: string; network: Network; monitoring: boolean }) => Promise<Wallet>
  removeWallet: (id: string) => Promise<void>
  toggleMonitoring: (id: string) => Promise<void>
}

const WalletsContext = createContext<WalletsContextValue | null>(null)

function toWallet(dto: { id: string; walletName: string; walletAddress: string; network: Network; isMonitoring: boolean; createdAt: string; updatedAt: string }): Wallet {
  return {
    id: dto.id,
    walletName: dto.walletName,
    walletAddress: dto.walletAddress,
    network: dto.network,
    isMonitoring: dto.isMonitoring,
    // Placeholder until the detection engine ships — not derived from real activity yet.
    riskScore: 'low',
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  }
}

export function WalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Array<Wallet>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getWallets()
      .then((data) => {
        if (cancelled) return
        setWallets(data.map(toWallet))
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Could not load your wallets.')
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const addWallet = useCallback(
    async (input: { name: string; address: string; network: Network; monitoring: boolean }) => {
      const created = await createWallet({
        walletName: input.name,
        walletAddress: input.address,
        network: input.network,
        isMonitoring: input.monitoring,
      })
      const wallet = toWallet(created)
      setWallets((prev) => [wallet, ...prev])
      return wallet
    },
    [],
  )

  const removeWallet = useCallback(async (id: string) => {
    await deleteWallet(id)
    setWallets((prev) => prev.filter((w) => w.id !== id))
  }, [])

  const toggleMonitoring = useCallback(
    async (id: string) => {
      const target = wallets.find((w) => w.id === id)
      if (!target) return
      const updated = await updateWallet(id, { isMonitoring: !target.isMonitoring })
      setWallets((prev) => prev.map((w) => (w.id === id ? toWallet(updated) : w)))
    },
    [wallets],
  )

  const value = useMemo(
    () => ({ wallets, isLoading, error, addWallet, removeWallet, toggleMonitoring }),
    [wallets, isLoading, error, addWallet, removeWallet, toggleMonitoring],
  )

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
}

export function useWallets() {
  const ctx = useContext(WalletsContext)
  if (!ctx) throw new Error('useWallets must be used within a WalletsProvider')
  return ctx
}
