import { apiClient } from './client'
export { ApiError } from './client'

export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
}

export async function registerUser(input: { fullName: string; email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>('/auth/register', input)
  return data
}

export async function loginUser(input: { email: string; password: string }) {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', input)
  return data
}

export async function refreshSession() {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh')
  return data
}

export async function logoutUser() {
  await apiClient.post<void>('/auth/logout')
}

export async function fetchCurrentUser() {
  const { data } = await apiClient.get<AuthUser>('/users/me')
  return data
}
