import { Injectable } from '@nestjs/common'
import type { AIInsight } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'

export interface CreateAiInsightInput {
  walletId: string
  alertId?: string
  summary: string
  recommendation: string
  confidence: number
  riskScore: string
}

@Injectable()
export class AiInsightsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateAiInsightInput): Promise<AIInsight> {
    return this.prisma.aIInsight.create({ data: input })
  }

  findLatestForUser(userId: string, take = 50): Promise<Array<AIInsight>> {
    return this.prisma.aIInsight.findMany({
      where: { wallet: { userId } },
      orderBy: { createdAt: 'desc' },
      take,
    })
  }
}
