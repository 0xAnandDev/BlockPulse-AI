import type { DetectorCategory } from '../monitoring/detectors/detector.interface'

/** Alerts don't persist a category column, so we re-derive it from the title the detectors themselves generate. */
export function categorizeAlertTitle(title: string): DetectorCategory {
  const t = title.toLowerCase()
  if (t.includes('ownership')) return 'OWNERSHIP_CHANGED'
  if (t.includes('approval')) return 'UNLIMITED_APPROVAL'
  if (t.includes('inactiv')) return 'WALLET_INACTIVE'
  if (t.includes('new contract') || t.includes('contract')) return 'NEW_CONTRACT'
  return 'LARGE_TRANSFER'
}

export const RECOMMENDATION_BY_CATEGORY: Record<DetectorCategory, string> = {
  LARGE_TRANSFER: 'Verify the destination address of recent large transfers and confirm they were authorized.',
  UNLIMITED_APPROVAL: 'Revoke unlimited token approvals that are no longer needed to limit exposure.',
  OWNERSHIP_CHANGED: "Audit the new owner's permissions and confirm this ownership change was expected.",
  NEW_CONTRACT: 'Review new contract counterparties before granting further approvals or transfers.',
  WALLET_INACTIVE: 'Continue periodic monitoring; no immediate action is required for inactivity alone.',
}
