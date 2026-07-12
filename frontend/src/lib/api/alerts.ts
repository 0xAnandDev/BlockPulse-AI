import { apiClient } from './client'
import { formatRelativeTime } from '../utils'
import type { AlertItem } from '../dashboard/types'

type AlertItemDto = Omit<AlertItem, 'timestamp'> & { timestamp: string }

export async function getAlerts(): Promise<Array<AlertItem>> {
  const { data } = await apiClient.get<Array<AlertItemDto>>('/alerts')
  return data.map((a) => ({ ...a, timestamp: formatRelativeTime(a.timestamp) }))
}

export async function getOpenAlerts(): Promise<Array<AlertItem>> {
  const { data } = await apiClient.get<Array<AlertItemDto>>('/alerts/open')
  return data.map((a) => ({ ...a, timestamp: formatRelativeTime(a.timestamp) }))
}
