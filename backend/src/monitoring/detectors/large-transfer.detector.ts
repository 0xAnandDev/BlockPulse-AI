import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { formatEther, parseEther } from 'ethers'
import type { DecodedEventContext, DetectorResult, EventDetector } from './detector.interface'

const DEFAULT_THRESHOLD_ETH = '1'

@Injectable()
export class LargeTransferDetector implements EventDetector {
  private readonly thresholdWei: bigint

  constructor(configService: ConfigService) {
    const thresholdEth = configService.get<string>('LARGE_TRANSFER_THRESHOLD_ETH') ?? DEFAULT_THRESHOLD_ETH
    this.thresholdWei = parseEther(thresholdEth)
  }

  detect({ event, valueWei }: DecodedEventContext): DetectorResult | null {
    if (event.eventType !== 'TRANSFER' || valueWei < this.thresholdWei) return null

    return {
      category: 'LARGE_TRANSFER',
      severity: 'HIGH',
      title: 'Large transfer detected',
      description: `${formatEther(valueWei)} ETH transferred in transaction ${event.transactionHash}.`,
    }
  }
}
