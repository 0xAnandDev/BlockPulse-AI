export interface NotificationChannel {
  id: string
  name: string
  status: 'connected' | 'coming-soon'
}

export const NOTIFICATION_CHANNELS: Array<NotificationChannel> = [
  { id: 'email', name: 'Email', status: 'connected' },
  { id: 'telegram', name: 'Telegram', status: 'connected' },
  { id: 'discord', name: 'Discord', status: 'coming-soon' },
]

export interface NotificationHistoryItem {
  id: string
  title: string
  channel: string
  time: string
}

export const NOTIFICATION_HISTORY: Array<NotificationHistoryItem> = [
  { id: 'n-1', title: 'Large transfer alert sent', channel: 'Email', time: '12:51 PM' },
  { id: 'n-2', title: 'Ownership change alert sent', channel: 'Telegram', time: '1:19 PM' },
  { id: 'n-3', title: 'Weekly protection summary sent', channel: 'Email', time: 'Yesterday' },
  { id: 'n-4', title: 'New wallet added confirmation', channel: 'Telegram', time: '3 days ago' },
]
