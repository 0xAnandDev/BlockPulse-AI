export interface NotificationPayload {
  to: string
  subject: string
  message: string
}

/**
 * Swap point for a real delivery integration per channel. Each provider only needs to implement
 * `send()` — nothing else in the notification pipeline depends on how delivery actually happens.
 */
export interface NotificationProvider {
  /** Resolves true if the message was actually dispatched, false if skipped/failed (never throws). */
  send(payload: NotificationPayload): Promise<boolean>
}
