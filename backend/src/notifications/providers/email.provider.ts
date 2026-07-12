import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createTransport, type Transporter } from 'nodemailer'
import type { NotificationPayload, NotificationProvider } from '../interfaces/notification-provider.interface'

/** Sends via SMTP when SMTP_HOST/SMTP_USER/SMTP_PASS are configured; otherwise logs and reports not-sent. */
@Injectable()
export class EmailNotificationProvider implements NotificationProvider {
  private readonly logger = new Logger(EmailNotificationProvider.name)
  private readonly transporter: Transporter | null
  private readonly fromAddress: string

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST')
    const user = this.configService.get<string>('SMTP_USER')
    const pass = this.configService.get<string>('SMTP_PASS')
    this.fromAddress = this.configService.get<string>('SMTP_FROM') || user || 'alerts@blockpulse.ai'

    this.transporter =
      host && user && pass
        ? createTransport({
            host,
            port: Number(this.configService.get<string>('SMTP_PORT') ?? 587),
            secure: this.configService.get<string>('SMTP_SECURE') === 'true',
            auth: { user, pass },
          })
        : null

    if (!this.transporter) {
      this.logger.warn('SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS) — email notifications will be logged only')
    }
  }

  async send(payload: NotificationPayload): Promise<boolean> {
    if (!this.transporter) {
      this.logger.log(`[email:skipped] to=${payload.to} subject="${payload.subject}"`)
      return false
    }

    try {
      await this.transporter.sendMail({ from: this.fromAddress, to: payload.to, subject: payload.subject, text: payload.message })
      return true
    } catch (err) {
      this.logger.error(`Failed to send email to ${payload.to}: ${(err as Error).message}`)
      return false
    }
  }
}
