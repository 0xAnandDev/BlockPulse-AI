import { Injectable } from '@nestjs/common'
import type { Alert } from '@prisma/client'
import { AlertsRepository } from './alerts.repository'
import { toAlertDto, type AlertDto } from './alert.mapper'
import type { CreateAlertInput } from './dto/create-alert.dto'

@Injectable()
export class AlertsService {
  constructor(private readonly alertsRepository: AlertsRepository) {}

  create(input: CreateAlertInput): Promise<Alert> {
    return this.alertsRepository.create(input)
  }

  async findAllForUser(userId: string): Promise<Array<AlertDto>> {
    const alerts = await this.alertsRepository.findAllForUser(userId)
    return alerts.map(toAlertDto)
  }

  async findOpenForUser(userId: string): Promise<Array<AlertDto>> {
    const alerts = await this.alertsRepository.findOpenForUser(userId)
    return alerts.map(toAlertDto)
  }

  async findAllForWallet(walletId: string): Promise<Array<AlertDto>> {
    const alerts = await this.alertsRepository.findAllForWallet(walletId)
    return alerts.map(toAlertDto)
  }

  findLatestByWalletAndTitle(walletId: string, title: string): Promise<Alert | null> {
    return this.alertsRepository.findLatestByWalletAndTitle(walletId, title)
  }

  countOpenForUser(userId: string): Promise<number> {
    return this.alertsRepository.countOpenForUser(userId)
  }
}
