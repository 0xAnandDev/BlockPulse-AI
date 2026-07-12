import { apiClient } from './client'
import { formatRelativeTime } from '../utils'
import type { AlertItem, AssistantReply, MonitoringStatus, WalletEvent, WalletSecurity } from '../dashboard/types'

type AlertItemDto = Omit<AlertItem, 'timestamp'> & { timestamp: string }

export function getWalletSecurity(walletId: string): Promise<WalletSecurity> {
  return apiClient.get<WalletSecurity>(`/wallets/${walletId}/security`).then((res) => res.data)
}

export function getWalletEvents(walletId: string): Promise<Array<WalletEvent>> {
  return apiClient.get<Array<WalletEvent>>(`/wallets/${walletId}/events`).then((res) => res.data)
}

export async function getWalletAlerts(walletId: string): Promise<Array<AlertItem>> {
  const { data } = await apiClient.get<Array<AlertItemDto>>(`/wallets/${walletId}/alerts`)
  return data.map((a) => ({ ...a, timestamp: formatRelativeTime(a.timestamp) }))
}

export function getMonitoringStatus(walletId: string): Promise<MonitoringStatus> {
  return apiClient.get<MonitoringStatus>(`/wallets/${walletId}/monitoring-status`).then((res) => res.data)
}

export function askAssistant(walletId: string, message: string): Promise<AssistantReply> {
  return apiClient.post<AssistantReply>(`/wallets/${walletId}/assistant`, { message }).then((res) => res.data)
}

export async function downloadSecurityReport(walletId: string, walletName: string): Promise<void> {
  const response = await apiClient.get(`/wallets/${walletId}/report`, { params: { format: 'pdf' }, responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `${walletName.replace(/[^a-z0-9-_]/gi, '_')}-security-report.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
