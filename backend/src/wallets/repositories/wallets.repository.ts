import { Injectable } from '@nestjs/common'
import type { Wallet } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import type { CreateWalletDto } from '../dto/create-wallet.dto'
import type { UpdateWalletDto } from '../dto/update-wallet.dto'

@Injectable()
export class WalletsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(userId: string, dto: CreateWalletDto): Promise<Wallet> {
    return this.prisma.wallet.create({
      data: {
        walletName: dto.walletName,
        walletAddress: dto.walletAddress,
        network: dto.network,
        isMonitoring: dto.isMonitoring ?? true,
        userId,
      },
    })
  }

  findAllByUser(userId: string): Promise<Array<Wallet>> {
    return this.prisma.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  findOneById(id: string): Promise<Wallet | null> {
    return this.prisma.wallet.findUnique({ where: { id } })
  }

  update(id: string, dto: UpdateWalletDto): Promise<Wallet> {
    return this.prisma.wallet.update({
      where: { id },
      data: dto,
    })
  }

  delete(id: string): Promise<Wallet> {
    return this.prisma.wallet.delete({ where: { id } })
  }
}
