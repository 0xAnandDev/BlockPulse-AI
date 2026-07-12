import { apiClient } from './client'
import { formatRelativeTime } from '../utils'
import type { AiFeedItem, AlertItem, ChartPoint, DashboardSummary, TimelineEvent } from '../dashboard/types'

interface DashboardSummaryDto {
  walletsProtected: number
  activeMonitoring: number
  currentRisk: DashboardSummary['currentRisk']
  aiConfidence: number
  recentAlerts: Array<Omit<AlertItem, 'timestamp'> & { timestamp: string }>
  timeline: Array<Omit<TimelineEvent, 'time'> & { time: string }>
  activityGraph: Array<ChartPoint>
  latestInsights: Array<Omit<AiFeedItem, 'time'> & { time: string }>
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data } = await apiClient.get<DashboardSummaryDto>('/dashboard')

  return {
    ...data,
    recentAlerts: data.recentAlerts.map((a) => ({ ...a, timestamp: formatRelativeTime(a.timestamp) })),
    timeline: data.timeline.map((e) => ({ ...e, time: formatRelativeTime(e.time) })),
    latestInsights: data.latestInsights.map((i) => ({ ...i, time: formatRelativeTime(i.time) })),
  }
}
