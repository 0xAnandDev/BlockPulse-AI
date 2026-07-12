import { Injectable } from '@nestjs/common'
import type { DecodedEventContext, DetectorResult, EventDetector } from './detector.interface'

@Injectable()
export class NewContractDetector implements EventDetector {
  detect({ event, isNewContractInteraction }: DecodedEventContext): DetectorResult | null {
    if (!isNewContractInteraction || !event.toAddress) return null

    return {
      category: 'NEW_CONTRACT',
      severity: 'MEDIUM',
      title: 'Interaction with new contract',
      description: `Wallet interacted with a previously unseen contract (${event.toAddress}) in transaction ${event.transactionHash}.`,
    }
  }
}
