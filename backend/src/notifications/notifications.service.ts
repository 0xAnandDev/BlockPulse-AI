import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Alert } from '@prisma/client'
import { NotificationsRepository } from './notifications.repository'
import { EmailNotificationProvider } from './providers/email.provider'
import { TelegramNotificationProvider } from './providers/telegram.provider'
import { toNotificationDto, type NotificationDto } from './notification.mapper'

const NOTIFIABLE_SEVERITIES: Array<Alert['severity']> = ['HIGH', 'CRITICAL']

/** Controller -> this service -> per-channel NotificationProvider implementations -> repository -> Prisma. */
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(
    private readonly repository: NotificationsRepository,
    private readonly emailProvider: EmailNotificationProvider,
    private readonly telegramProvider: TelegramNotificationProvider,
    private readonly configService: ConfigService,
  ) {}

  /** No-ops for LOW/MEDIUM severity — only High/Critical alerts page the wallet owner. */
  async notifyForAlert(alert: Alert): Promise<void> {
    if (!NOTIFIABLE_SEVERITIES.includes(alert.severity)) return

    const recipient = await this.repository.getRecipientForWallet(alert.walletId)
    if (!recipient) return

    const subject = `BlockPulse AI Alert: ${alert.title}`

    const emailSent = await this.emailProvider.send({ to: recipient.email, subject, message: alert.description })
    await this.repository.create(alert.walletId, alert.id, 'EMAIL', emailSent ? 'SENT' : 'FAILED')

    // No per-user Telegram chat id is captured yet, so this falls back to one shared operator chat
    // configured via TELEGRAM_CHAT_ID until per-user notification preferences exist.
    const telegramChatId = recipient.telegramChatId ?? this.configService.get<string>('TELEGRAM_CHAT_ID') ?? null
    if (telegramChatId) {
      const telegramSent = await this.telegramProvider.send({ to: telegramChatId, subject, message: alert.description })
      await this.repository.create(alert.walletId, alert.id, 'TELEGRAM', telegramSent ? 'SENT' : 'FAILED')
    } else {
      await this.repository.create(alert.walletId, alert.id, 'TELEGRAM', 'PENDING')
    }

    this.logger.log(`Dispatched notifications for alert ${alert.id} (${alert.severity})`)
  }

  async findAllForUser(userId: string): Promise<Array<NotificationDto>> {
    const rows = await this.repository.findAllForUser(userId)
    return rows.map(toNotificationDto)
  }
}
