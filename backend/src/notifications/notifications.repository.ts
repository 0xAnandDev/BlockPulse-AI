import { Injectable } from '@nestjs/common'
import type { Notification, NotificationChannel, NotificationStatus } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export type NotificationWithAlert = Notification & {
  wallet: { walletName: string }
  alert: { title: string; description: string; severity: string } | null
}

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    walletId: string,
    alertId: string | null,
    channel: NotificationChannel,
    status: NotificationStatus,
  ): Promise<Notification> {
    return this.prisma.notification.create({
      data: { walletId, alertId, channel, status, sentAt: status === 'SENT' ? new Date() : null },
    })
  }

  findAllForUser(userId: string, take = 50): Promise<Array<NotificationWithAlert>> {
    return this.prisma.notification.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: 'desc' },
      take,
      include: {
        wallet: { select: { walletName: true } },
        alert: { select: { title: true, description: true, severity: true } },
      },
    })
  }

  /** Owner's email plus an optional per-wallet Telegram chat id override, for resolving delivery targets. */
  async getRecipientForWallet(walletId: string): Promise<{ email: string; telegramChatId: string | null } | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { user: { select: { email: true } } },
    })
    if (!wallet) return null
    return { email: wallet.user.email, telegramChatId: null }
  }
}
