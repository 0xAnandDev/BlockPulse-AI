import { Injectable, Logger } from '@nestjs/common'
import { Interval } from '@nestjs/schedule'
import { MonitoringService } from './monitoring.service'

const POLL_INTERVAL_MS = 20_000

@Injectable()
export class MonitoringScheduler {
  private readonly logger = new Logger(MonitoringScheduler.name)
  private isRunning = false

  constructor(private readonly monitoringService: MonitoringService) {}

  @Interval(POLL_INTERVAL_MS)
  async handleInterval(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Previous monitoring cycle still running, skipping this tick')
      return
    }

    this.isRunning = true
    try {
      await this.monitoringService.runCycle()
    } catch (err) {
      this.logger.error(`Monitoring cycle failed: ${(err as Error).message}`)
    } finally {
      this.isRunning = false
    }
  }
}
