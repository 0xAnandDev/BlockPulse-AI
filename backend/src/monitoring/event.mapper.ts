import type { BlockchainEvent } from '@prisma/client'

export interface EventDto {
  id: string
  transactionHash: string
  blockNumber: string
  eventType: string
  network: string
  fromAddress: string
  toAddress: string | null
  value: string
  status: string
  createdAt: string
}

export function toEventDto(event: BlockchainEvent): EventDto {
  return {
    id: event.id,
    transactionHash: event.transactionHash,
    blockNumber: event.blockNumber.toString(),
    eventType: event.eventType,
    network: event.network,
    fromAddress: event.fromAddress,
    toAddress: event.toAddress,
    value: event.value,
    status: event.status,
    createdAt: event.createdAt.toISOString(),
  }
}
