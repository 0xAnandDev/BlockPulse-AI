import type { NotificationWithAlert } from './notifications.repository'

export interface NotificationDto {
  id: string
  title: string
  detail: string
  walletName: string
  channel: 'email' | 'telegram'
  status: 'sent' | 'failed' | 'pending'
  time: string
}

export function toNotificationDto(row: NotificationWithAlert): NotificationDto {
  return {
    id: row.id,
    title: row.alert?.title ?? 'BlockPulse AI notification',
    detail: row.alert?.description ?? '',
    walletName: row.wallet.walletName,
    channel: row.channel === 'EMAIL' ? 'email' : 'telegram',
    status: row.status.toLowerCase() as NotificationDto['status'],
    time: (row.sentAt ?? row.createdAt).toISOString(),
  }
}
