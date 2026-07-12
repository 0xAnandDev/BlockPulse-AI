import { fetchCurrentUser, type AuthUser } from './auth'

let cachedUser: AuthUser | null = null
let pendingFetch: Promise<AuthUser> | null = null

export function getCachedUser(): AuthUser | null {
  return cachedUser
}

export function loadCurrentUser(): Promise<AuthUser> {
  if (cachedUser) return Promise.resolve(cachedUser)
  if (!pendingFetch) {
    pendingFetch = fetchCurrentUser()
      .then((user) => {
        cachedUser = user
        return user
      })
      .finally(() => {
        pendingFetch = null
      })
  }
  return pendingFetch
}

export function clearCachedUser(): void {
  cachedUser = null
}
