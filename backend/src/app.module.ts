import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { APP_GUARD } from '@nestjs/core'
import { PrismaModule } from './prisma/prisma.module'
import { EthereumModule } from './ethereum/ethereum.module'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { WalletsModule } from './wallets/wallets.module'
import { AlertsModule } from './alerts/alerts.module'
import { AiInsightsModule } from './ai-insights/ai-insights.module'
import { MonitoringModule } from './monitoring/monitoring.module'
import { ThreatAnalysisModule } from './threat-analysis/threat-analysis.module'
import { NotificationsModule } from './notifications/notifications.module'
import { DashboardModule } from './dashboard/dashboard.module'
import { AppController } from './app.controller'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    EthereumModule,
    AuthModule,
    UsersModule,
    WalletsModule,
    AlertsModule,
    AiInsightsModule,
    MonitoringModule,
    ThreatAnalysisModule,
    NotificationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
