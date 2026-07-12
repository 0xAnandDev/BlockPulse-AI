import type { BlockchainEvent, Severity, Wallet } from '@prisma/client'

export type DetectorCategory =
  | 'LARGE_TRANSFER'
  | 'UNLIMITED_APPROVAL'
  | 'OWNERSHIP_CHANGED'
  | 'NEW_CONTRACT'
  | 'WALLET_INACTIVE'

export interface DetectorResult {
  category: DetectorCategory
  severity: Severity
  title: string
  description: string
}

/** Decoded, detector-friendly view of a BlockchainEvent's rawData payload. */
export interface DecodedEventContext {
  event: BlockchainEvent
  /** Wei value as a bigint, parsed from BlockchainEvent.value. */
  valueWei: bigint
  /** Present only for APPROVAL events. */
  approval?: { owner: string; spender: string; allowance: bigint }
  /** Present only for OWNERSHIP_TRANSFER events. */
  ownershipTransfer?: { previousOwner: string; newOwner: string }
  /** Whether event.toAddress is a contract not previously seen for this wallet. */
  isNewContractInteraction: boolean
}

/** Detectors 1-4: triggered per newly-ingested BlockchainEvent. */
export interface EventDetector {
  detect(context: DecodedEventContext): DetectorResult | null
}

/** Detector 5: triggered per monitored wallet on each polling cycle, independent of new events. */
export interface WalletDetector {
  detect(wallet: Wallet, lastActivityAt: Date | null): DetectorResult | null
}
