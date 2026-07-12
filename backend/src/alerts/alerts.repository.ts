import { Injectable } from '@nestjs/common'
import type { Alert } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import type { CreateAlertInput } from './dto/create-alert.dto'

export type AlertWithNetwork = Alert & { wallet: { network: string } }

@Injectable()
export class AlertsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAlertInput): Promise<Alert> {
    return this.prisma.alert.create({
      data: {
        walletId: input.walletId,
        blockchainEventId: input.blockchainEventId,
        severity: input.severity,
        title: input.title,
        description: input.description,
      },
    })
  }

  findAllForUser(userId: string, take = 50): Promise<Array<AlertWithNetwork>> {
    return this.prisma.alert.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: 'desc' },
      take,
      include: { wallet: { select: { network: true } } },
    })
  }

  findOpenForUser(userId: string, take = 50): Promise<Array<AlertWithNetwork>> {
    return this.prisma.alert.findMany({
      where: { wallet: { userId }, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take,
      include: { wallet: { select: { network: true } } },
    })
  }

  findAllForWallet(walletId: string, take = 50): Promise<Array<AlertWithNetwork>> {
    return this.prisma.alert.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take,
      include: { wallet: { select: { network: true } } },
    })
  }

  /** Most recent alert of a given title for a wallet, used to de-duplicate recurring conditions (e.g. inactivity). */
  findLatestByWalletAndTitle(walletId: string, title: string): Promise<Alert | null> {
    return this.prisma.alert.findFirst({
      where: { walletId, title },
      orderBy: { createdAt: 'desc' },
    })
  }

  countOpenForUser(userId: string): Promise<number> {
    return this.prisma.alert.count({ where: { wallet: { userId }, status: 'OPEN' } })
  }
}
