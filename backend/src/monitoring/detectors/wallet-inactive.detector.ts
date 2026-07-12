import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Wallet } from '@prisma/client'
import type { DetectorResult, WalletDetector } from './detector.interface'

const DEFAULT_INACTIVE_HOURS = 24

@Injectable()
export class WalletInactiveDetector implements WalletDetector {
  private readonly inactiveThresholdMs: number

  constructor(configService: ConfigService) {
    const hours = configService.get<string>('WALLET_INACTIVE_HOURS')
    this.inactiveThresholdMs = (hours ? Number(hours) : DEFAULT_INACTIVE_HOURS) * 60 * 60 * 1000
  }

  detect(wallet: Wallet, lastActivityAt: Date | null): DetectorResult | null {
    const referenceDate = lastActivityAt ?? wallet.createdAt
    const inactiveMs = Date.now() - referenceDate.getTime()
    if (inactiveMs < this.inactiveThresholdMs) return null

    const inactiveDays = Math.floor(inactiveMs / (24 * 60 * 60 * 1000))

    return {
      category: 'WALLET_INACTIVE',
      severity: 'LOW',
      title: 'Wallet inactivity notice',
      description: `No on-chain activity detected for ${inactiveDays} day${inactiveDays === 1 ? '' : 's'}.`,
    }
  }
}
