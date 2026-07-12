import { Injectable } from '@nestjs/common'
import type { DecodedEventContext, DetectorResult, EventDetector } from './detector.interface'

@Injectable()
export class OwnershipDetector implements EventDetector {
  detect({ event, ownershipTransfer }: DecodedEventContext): DetectorResult | null {
    if (event.eventType !== 'OWNERSHIP_TRANSFER' || !ownershipTransfer) return null

    return {
      category: 'OWNERSHIP_CHANGED',
      severity: 'CRITICAL',
      title: 'Contract ownership changed',
      description: `Ownership transferred from ${ownershipTransfer.previousOwner} to ${ownershipTransfer.newOwner} in transaction ${event.transactionHash}.`,
    }
  }
}
