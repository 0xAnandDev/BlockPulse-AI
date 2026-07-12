import { Injectable } from '@nestjs/common'

export type MonitoringPhase = 'idle' | 'scanning' | 'analyzing' | 'ai-analysis' | 'threat-score-updated'

export interface MonitoringStatusSnapshot {
  phase: MonitoringPhase
  nextScanAt: string
}

/** In-memory, process-wide view of what the scheduler is doing right now — purely a UX signal, not persisted. */
@Injectable()
export class MonitoringStatusService {
  private phase: MonitoringPhase = 'idle'
  private nextScanAt = new Date()

  setPhase(phase: MonitoringPhase): void {
    this.phase = phase
  }

  scheduleNextScan(at: Date): void {
    this.nextScanAt = at
  }

  getSnapshot(): MonitoringStatusSnapshot {
    return { phase: this.phase, nextScanAt: this.nextScanAt.toISOString() }
  }
}
