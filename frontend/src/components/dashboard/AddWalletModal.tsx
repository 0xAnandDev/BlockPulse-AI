import { useState } from 'react'
import { Wallet as WalletIcon } from 'lucide-react'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Select from '../ui/Select'
import Checkbox from '../ui/Checkbox'
import Button from '../ui/Button'
import { useWallets } from '../../lib/dashboard/store'
import { NETWORKS } from '../../lib/dashboard/types'
import type { Network } from '../../lib/dashboard/types'

export interface AddWalletModalProps {
  isOpen: boolean
  onClose: () => void
}

const NETWORK_OPTIONS = NETWORKS.map((network) => ({ value: network, label: network }))

export default function AddWalletModal({ isOpen, onClose }: AddWalletModalProps) {
  const { addWallet } = useWallets()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [network, setNetwork] = useState<Network>('Ethereum')
  const [monitoring, setMonitoring] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetAndClose = () => {
    setName('')
    setAddress('')
    setNetwork('Ethereum')
    setMonitoring(true)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Wallet name is required')
      return
    }
    if (!/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
      setError('Enter a valid wallet address (0x...)')
      return
    }
    setError(null)
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    addWallet({ name: name.trim(), address: address.trim(), network, monitoring })
    setIsSubmitting(false)
    resetAndClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={resetAndClose}
      title="Add a wallet"
      description="BlockPulse AI will start watching this wallet for suspicious activity."
    >
      <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
        <Input
          label="Wallet Name"
          placeholder="e.g. Main Treasury"
          icon={<WalletIcon className="h-4 w-4" aria-hidden="true" />}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Wallet Address"
          placeholder="0x..."
          className="font-mono text-xs"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Select
          label="Blockchain Network"
          options={NETWORK_OPTIONS}
          value={network}
          onChange={(e) => setNetwork(e.target.value as Network)}
        />
        <Checkbox
          label="Enable monitoring immediately"
          checked={monitoring}
          onChange={(e) => setMonitoring(e.target.checked)}
        />

        {error && (
          <p role="alert" className="rounded-lg border border-[rgba(244,63,94,0.35)] bg-[rgba(244,63,94,0.1)] px-4 py-2.5 text-sm text-[var(--risk-high)]">
            {error}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting}>
          Start Monitoring
        </Button>
      </form>
    </Modal>
  )
}
