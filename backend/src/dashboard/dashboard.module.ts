import { Module } from '@nestjs/common'
import { WalletsModule } from '../wallets/wallets.module'
import { AlertsModule } from '../alerts/alerts.module'
import { MonitoringModule } from '../monitoring/monitoring.module'
import { ThreatAnalysisModule } from '../threat-analysis/threat-analysis.module'
import { DashboardController } from './dashboard.controller'
import { DashboardService } from './dashboard.service'

@Module({
  imports: [WalletsModule, AlertsModule, MonitoringModule, ThreatAnalysisModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
