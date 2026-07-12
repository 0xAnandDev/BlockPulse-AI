import { Injectable } from '@nestjs/common'
import type { Alert } from '@prisma/client'
import { categorizeAlertTitle, RECOMMENDATION_BY_CATEGORY } from './alert-category.util'

/** Turns detected event categories into modular, reusable recommendation strings. */
@Injectable()
export class RecommendationEngine {
  generate(alerts: Array<Alert>): Array<string> {
    const openCategories = new Set(alerts.filter((a) => a.status === 'OPEN').map((a) => categorizeAlertTitle(a.title)))

    if (openCategories.size === 0) {
      return ['No active threats detected. Continue standard monitoring.']
    }

    return Array.from(openCategories).map((category) => RECOMMENDATION_BY_CATEGORY[category])
  }
}
