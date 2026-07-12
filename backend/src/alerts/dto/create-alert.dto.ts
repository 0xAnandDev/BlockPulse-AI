import type { Severity } from '@prisma/client'

export interface CreateAlertInput {
  walletId: string
  blockchainEventId?: string
  severity: Severity
  title: string
  description: string
}
