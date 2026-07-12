import { apiClient } from './client'
import { formatRelativeTime } from '../utils'
import type { NotificationItem } from '../dashboard/types'

type NotificationItemDto = Omit<NotificationItem, 'time'> & { time: string }

export async function getNotifications(): Promise<Array<NotificationItem>> {
  const { data } = await apiClient.get<Array<NotificationItemDto>>('/notifications')
  return data.map((n) => ({ ...n, time: formatRelativeTime(n.time) }))
}
