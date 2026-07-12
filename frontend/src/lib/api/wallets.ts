import { apiClient } from './client'
import type { Network } from '../dashboard/types'

export interface WalletDto {
  id: string
  walletName: string
  walletAddress: string
  network: Network
  isMonitoring: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface CreateWalletInput {
  walletName: string
  walletAddress: string
  network: Network
  isMonitoring?: boolean
}

export interface UpdateWalletInput {
  walletName?: string
  walletAddress?: string
  network?: Network
  isMonitoring?: boolean
}

export async function getWallets() {
  const { data } = await apiClient.get<Array<WalletDto>>('/wallets')
  return data
}

export async function getWallet(id: string) {
  const { data } = await apiClient.get<WalletDto>(`/wallets/${id}`)
  return data
}

export async function createWallet(input: CreateWalletInput) {
  const { data } = await apiClient.post<WalletDto>('/wallets', input)
  return data
}

export async function updateWallet(id: string, input: UpdateWalletInput) {
  const { data } = await apiClient.patch<WalletDto>(`/wallets/${id}`, input)
  return data
}

export async function deleteWallet(id: string) {
  await apiClient.delete<void>(`/wallets/${id}`)
}
