import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Network, RiskLevel, Wallet } from './types'

const STORAGE_KEY = 'bp_wallets'

function loadWallets(): Array<Wallet> {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Array<Wallet>) : []
  } catch {
    return []
  }
}

function saveWallets(wallets: Array<Wallet>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(wallets))
}

const RISK_POOL: Array<RiskLevel> = ['low', 'low', 'low', 'medium', 'high']

interface WalletsContextValue {
  wallets: Array<Wallet>
  isLoading: boolean
  addWallet: (input: { name: string; address: string; network: Network; monitoring: boolean }) => Wallet
  removeWallet: (id: string) => void
  toggleMonitoring: (id: string) => void
}

const WalletsContext = createContext<WalletsContextValue | null>(null)

export function WalletsProvider({ children }: { children: ReactNode }) {
  const [wallets, setWallets] = useState<Array<Wallet>>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setWallets(loadWallets())
    setIsLoading(false)
  }, [])

  const persist = useCallback((next: Array<Wallet>) => {
    setWallets(next)
    saveWallets(next)
  }, [])

  const addWallet = useCallback(
    (input: { name: string; address: string; network: Network; monitoring: boolean }) => {
      const wallet: Wallet = {
        id: crypto.randomUUID(),
        name: input.name,
        address: input.address,
        network: input.network,
        monitoring: input.monitoring,
        riskScore: RISK_POOL[Math.floor(Math.random() * RISK_POOL.length)],
        lastActivity: 'Just now',
        createdAt: new Date().toISOString(),
      }
      persist([wallet, ...wallets])
      return wallet
    },
    [wallets, persist],
  )

  const removeWallet = useCallback(
    (id: string) => {
      persist(wallets.filter((w) => w.id !== id))
    },
    [wallets, persist],
  )

  const toggleMonitoring = useCallback(
    (id: string) => {
      persist(wallets.map((w) => (w.id === id ? { ...w, monitoring: !w.monitoring } : w)))
    },
    [wallets, persist],
  )

  const value = useMemo(
    () => ({ wallets, isLoading, addWallet, removeWallet, toggleMonitoring }),
    [wallets, isLoading, addWallet, removeWallet, toggleMonitoring],
  )

  return <WalletsContext.Provider value={value}>{children}</WalletsContext.Provider>
}

export function useWallets() {
  const ctx = useContext(WalletsContext)
  if (!ctx) throw new Error('useWallets must be used within a WalletsProvider')
  return ctx
}
