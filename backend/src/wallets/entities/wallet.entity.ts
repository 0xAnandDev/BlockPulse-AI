import { ApiProperty } from '@nestjs/swagger'
import type { Wallet } from '@prisma/client'

export class WalletEntity {
  @ApiProperty()
  id: string

  @ApiProperty()
  walletName: string

  @ApiProperty()
  walletAddress: string

  @ApiProperty()
  network: string

  @ApiProperty()
  isMonitoring: boolean

  @ApiProperty()
  userId: string

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date

  constructor(wallet: Wallet) {
    this.id = wallet.id
    this.walletName = wallet.walletName
    this.walletAddress = wallet.walletAddress
    this.network = wallet.network
    this.isMonitoring = wallet.isMonitoring
    this.userId = wallet.userId
    this.createdAt = wallet.createdAt
    this.updatedAt = wallet.updatedAt
  }
}
