import { Injectable } from '@nestjs/common'
import { MaxUint256 } from 'ethers'
import type { DecodedEventContext, DetectorResult, EventDetector } from './detector.interface'

@Injectable()
export class ApprovalDetector implements EventDetector {
  detect({ event, approval }: DecodedEventContext): DetectorResult | null {
    if (event.eventType !== 'APPROVAL' || !approval) return null
    if (approval.allowance !== MaxUint256) return null

    return {
      category: 'UNLIMITED_APPROVAL',
      severity: 'HIGH',
      title: 'Unlimited token approval detected',
      description: `Unlimited spending approval granted to ${approval.spender} in transaction ${event.transactionHash}.`,
    }
  }
}
