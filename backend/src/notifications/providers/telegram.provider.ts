import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { NotificationPayload, NotificationProvider } from '../interfaces/notification-provider.interface'

/** Sends via the Telegram Bot API when TELEGRAM_BOT_TOKEN is configured; `payload.to` is the target chat id. */
@Injectable()
export class TelegramNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(TelegramNotificationProvider.name)
  private readonly botToken: string | undefined

  constructor(private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN')
    if (!this.botToken) {
      this.logger.warn('TELEGRAM_BOT_TOKEN not configured — Telegram notifications will be logged only')
    }
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.botToken || !payload.to) {
      this.logger.log(`[telegram:skipped] to=${payload.to || '(no chat id)'} subject="${payload.subject}"`)
      return false
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${this.botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: payload.to, text: `${payload.subject}\n\n${payload.message}` }),
      })
      if (!response.ok) {
        this.logger.error(`Telegram API responded ${response.status} for chat ${payload.to}`)
        return false
      }
      return true
    } catch (err) {
      this.logger.error(`Failed to send Telegram message to ${payload.to}: ${(err as Error).message}`)
      return false
    }
  }
}
