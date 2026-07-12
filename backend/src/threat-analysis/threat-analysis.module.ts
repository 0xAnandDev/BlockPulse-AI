import { Module } from '@nestjs/common'
import { WalletsModule } from '../wallets/wallets.module'
import { ThreatAnalysisController } from './threat-analysis.controller'
import { ThreatAnalysisService } from './threat-analysis.service'
import { ThreatAnalysisRepository } from './threat-analysis.repository'
import { RiskScoreEngine } from './risk-score.engine'
import { RecommendationEngine } from './recommendation.engine'
import { WalletProfileEngine } from './wallet-profile.engine'
import { HistoryEngine } from './history.engine'
import { MockAIProvider } from './mock-ai.provider'

@Module({
  imports: [WalletsModule],
  controllers: [ThreatAnalysisController],
  providers: [
    ThreatAnalysisService,
    ThreatAnalysisRepository,
    RiskScoreEngine,
    RecommendationEngine,
    WalletProfileEngine,
    HistoryEngine,
    MockAIProvider,
  ],
  exports: [ThreatAnalysisService],
})
export class ThreatAnalysisModule {}
