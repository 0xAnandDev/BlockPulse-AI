export interface WalletSecurityProfile {
  /** Days since BlockPulse began monitoring this wallet (on-chain wallet creation date isn't derivable without a full-history scan). */
  walletAge: number
  totalTransactions: number
  recentTransactions: number
  activeContracts: number
  uniqueRecipients: number
  approvalCount: number
  ownershipChanges: number
  largeTransfers: number
  lastActivity: Date | null
  averageTransactionValue: string
  riskTrend: 'increasing' | 'decreasing' | 'stable'
  monitoringDuration: number
}
