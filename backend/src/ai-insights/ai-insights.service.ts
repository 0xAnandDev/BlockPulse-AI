import { Injectable } from '@nestjs/common'
import type { AIInsight } from '@prisma/client'
import { AiInsightsRepository, type CreateAiInsightInput } from './ai-insights.repository'

@Injectable()
export class AiInsightsService {
  constructor(private readonly aiInsightsRepository: AiInsightsRepository) {}

  create(input: CreateAiInsightInput): Promise<AIInsight> {
    return this.aiInsightsRepository.create(input)
  }

  findLatestForUser(userId: string): Promise<Array<AIInsight>> {
    return this.aiInsightsRepository.findLatestForUser(userId)
  }
}
