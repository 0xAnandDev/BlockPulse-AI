const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

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

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => null)
    throw new ApiError(res.status, body?.message ?? 'Something went wrong. Please try again.')
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export function registerUser(input: { fullName: string; email: string; password: string }) {
  return request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(input) })
}

export function loginUser(input: { email: string; password: string }) {
  return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(input) })
}

export function refreshSession() {
  return request<AuthResponse>('/auth/refresh', { method: 'POST' })
}

export function logoutUser() {
  return request<void>('/auth/logout', { method: 'POST' })
}

export function fetchCurrentUser(accessToken: string) {
  return request<AuthUser>('/users/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
}
