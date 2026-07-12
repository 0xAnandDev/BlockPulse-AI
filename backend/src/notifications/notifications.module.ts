import { Module } from '@nestjs/common'
import { NotificationsController } from './notifications.controller'
import { NotificationsService } from './notifications.service'
import { NotificationsRepository } from './notifications.repository'
import { EmailNotificationProvider } from './providers/email.provider'
import { TelegramNotificationProvider } from './providers/telegram.provider'

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository, EmailNotificationProvider, TelegramNotificationProvider],
  exports: [NotificationsService],
})
export class NotificationsModule {}
