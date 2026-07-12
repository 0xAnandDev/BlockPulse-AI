import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { MonitoringService } from './monitoring.service'
import { MonitoringStatusService } from './monitoring-status.service'

export const POLL_INTERVAL_MS = 20_000

@Injectable()
export class MonitoringScheduler {
  private readonly logger = new Logger(MonitoringScheduler.name)
  private isRunning = false

  constructor(
    private readonly monitoringService: MonitoringService,
    private readonly statusService: MonitoringStatusService,
  ) {
    this.statusService.scheduleNextScan(new Date(Date.now() + POLL_INTERVAL_MS))
  }

  @Interval(POLL_INTERVAL_MS)
  async handleInterval(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Previous monitoring cycle still running, skipping this tick')
      return
    }

    this.isRunning = true
    this.statusService.setPhase('scanning')
    try {
      await this.monitoringService.runCycle()
    } catch (err) {
      this.logger.error(`Monitoring cycle failed: ${(err as Error).message}`)
    } finally {
      this.statusService.setPhase('idle')
      this.statusService.scheduleNextScan(new Date(Date.now() + POLL_INTERVAL_MS))
      this.isRunning = false
    }
  }
}
