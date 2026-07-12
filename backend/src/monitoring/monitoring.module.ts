import { Module } from '@nestjs/common'
import { AlertsModule } from '../alerts/alerts.module'
import { MonitoringController } from './monitoring.controller'
import { MonitoringService } from './monitoring.service'
import { MonitoringRepository } from './monitoring.repository'
import { MonitoringScheduler } from './monitoring.scheduler'
import { AiAnalysisService } from './ai-analysis.service'
import { LargeTransferDetector } from './detectors/large-transfer.detector'
import { ApprovalDetector } from './detectors/approval.detector'
import { OwnershipDetector } from './detectors/ownership.detector'
import { NewContractDetector } from './detectors/new-contract.detector'
import { WalletInactiveDetector } from './detectors/wallet-inactive.detector'

@Module({
  imports: [AlertsModule],
  controllers: [MonitoringController],
  providers: [
    MonitoringService,
    MonitoringRepository,
    MonitoringScheduler,
    AiAnalysisService,
    LargeTransferDetector,
    ApprovalDetector,
    OwnershipDetector,
    NewContractDetector,
    WalletInactiveDetector,
  ],
  exports: [MonitoringRepository],
})
export class MonitoringModule {}
