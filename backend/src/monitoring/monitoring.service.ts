import { Injectable, Logger } from '@nestjs/common'
import type { BlockchainEvent, EventType, Wallet } from '@prisma/client'
import type { Log, TransactionResponse } from 'ethers'
import { getAddress, zeroPadValue } from 'ethers'
import {
  APPROVAL_TOPIC,
  EthereumProviderService,
  OWNERSHIP_TRANSFERRED_TOPIC,
  erc20ApprovalInterface,
  ownershipTransferredInterface,
} from '../ethereum/ethereum-provider.service'
import { MonitoringRepository } from './monitoring.repository'
import { MonitoringStatusService } from './monitoring-status.service'
import { AiAnalysisService } from './ai-analysis.service'
import { LargeTransferDetector } from './detectors/large-transfer.detector'
import { ApprovalDetector } from './detectors/approval.detector'
import { OwnershipDetector } from './detectors/ownership.detector'
import { NewContractDetector } from './detectors/new-contract.detector'
import { WalletInactiveDetector } from './detectors/wallet-inactive.detector'
import type { DecodedEventContext, EventDetector } from './detectors/detector.interface'
import { AlertsService } from '../alerts/alerts.service'
import { NotificationsService } from '../notifications/notifications.service'

const BACKFILL_BLOCKS = 50
const MAX_BLOCK_RANGE_PER_TICK = 50
const INACTIVITY_ALERT_COOLDOWN_MS = 24 * 60 * 60 * 1000

function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? v.toString() : v)))
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name)
  private readonly eventDetectors: Array<EventDetector>

  constructor(
    private readonly ethereumProvider: EthereumProviderService,
    private readonly monitoringRepository: MonitoringRepository,
    private readonly statusService: MonitoringStatusService,
    private readonly alertsService: AlertsService,
    private readonly aiAnalysisService: AiAnalysisService,
    private readonly notificationsService: NotificationsService,
    largeTransferDetector: LargeTransferDetector,
    approvalDetector: ApprovalDetector,
    ownershipDetector: OwnershipDetector,
    newContractDetector: NewContractDetector,
    private readonly walletInactiveDetector: WalletInactiveDetector,
  ) {
    this.eventDetectors = [largeTransferDetector, approvalDetector, ownershipDetector, newContractDetector]
  }

  findLatestEventsForUser(userId: string) {
    return this.monitoringRepository.findLatestForUser(userId)
  }

  async runCycle(): Promise<void> {
    const wallets = await this.monitoringRepository.findMonitoredWallets()
    for (const wallet of wallets) {
      try {
        await this.processWallet(wallet)
      } catch (err) {
        this.logger.error(`Failed to process wallet ${wallet.id}: ${(err as Error).message}`)
      }
      try {
        await this.checkInactivity(wallet)
      } catch (err) {
        this.logger.error(`Inactivity check failed for wallet ${wallet.id}: ${(err as Error).message}`)
      }
    }
  }

  private async processWallet(wallet: Wallet): Promise<void> {
    const latestBlock = await this.ethereumProvider.getLatestBlockNumber()
    const fromBlock =
      wallet.lastProcessedBlock != null ? Number(wallet.lastProcessedBlock) + 1 : Math.max(latestBlock - BACKFILL_BLOCKS, 0)

    if (fromBlock > latestBlock) return

    const toBlock = Math.min(fromBlock + MAX_BLOCK_RANGE_PER_TICK - 1, latestBlock)
    const address = getAddress(wallet.walletAddress)
    const knownCounterparties = await this.monitoringRepository.getKnownCounterparties(wallet.id)

    const newEvents: Array<BlockchainEvent> = []

    for (let blockNumber = fromBlock; blockNumber <= toBlock; blockNumber++) {
      const created = await this.scanBlockForWallet(blockNumber, address, wallet, knownCounterparties)
      newEvents.push(...created)
    }

    await this.monitoringRepository.updateLastProcessedBlock(wallet.id, BigInt(toBlock))

    for (const event of newEvents) {
      await this.runEventDetectors(event, address, knownCounterparties)
    }

    this.logger.log(`Wallet ${wallet.walletName}: scanned blocks ${fromBlock}-${toBlock}, ${newEvents.length} new event(s)`)
  }

  private async scanBlockForWallet(
    blockNumber: number,
    address: string,
    wallet: Wallet,
    knownCounterparties: Set<string>,
  ): Promise<Array<BlockchainEvent>> {
    const created: Array<BlockchainEvent> = []

    const block = await this.ethereumProvider.getBlockWithTransactions(blockNumber)
    if (block) {
      const matches = block.prefetchedTransactions.filter(
        (tx) => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
      )

      for (const tx of matches) {
        const event = await this.persistTransferEvent(tx, wallet)
        if (event) created.push(event)
      }
    }

    const logs = await this.ethereumProvider.getLogsInRange(blockNumber, blockNumber, [
      APPROVAL_TOPIC,
      OWNERSHIP_TRANSFERRED_TOPIC,
    ])

    for (const log of logs) {
      const event = await this.persistLogEvent(log, address, wallet)
      if (event) created.push(event)
    }

    return created
  }

  private async persistTransferEvent(tx: TransactionResponse, wallet: Wallet): Promise<BlockchainEvent | null> {
    const receipt = await this.ethereumProvider.getTransactionReceipt(tx.hash)
    const status = receipt?.status === 0 ? 'FAILED' : 'SUCCESS'

    return this.monitoringRepository.createEventIfUnseen({
      walletId: wallet.id,
      transactionHash: tx.hash,
      blockNumber: BigInt(tx.blockNumber ?? 0),
      eventType: 'TRANSFER' as EventType,
      fromAddress: tx.from,
      toAddress: tx.to,
      value: tx.value.toString(),
      gasUsed: receipt ? receipt.gasUsed.toString() : null,
      status,
      rawData: toJsonSafe({ hash: tx.hash, from: tx.from, to: tx.to, value: tx.value, blockNumber: tx.blockNumber }),
    })
  }

  private async persistLogEvent(log: Log, walletAddress: string, wallet: Wallet): Promise<BlockchainEvent | null> {
    const walletTopic = zeroPadValue(walletAddress.toLowerCase(), 32)
    const involvesWallet = log.topics.slice(1).some((t) => t.toLowerCase() === walletTopic)
    if (!involvesWallet) return null

    if (log.topics[0] === APPROVAL_TOPIC) {
      const parsed = erc20ApprovalInterface.parseLog(log)
      if (!parsed) return null
      const [owner, spender, value] = parsed.args as unknown as [string, string, bigint]

      return this.monitoringRepository.createEventIfUnseen({
        walletId: wallet.id,
        transactionHash: log.transactionHash,
        blockNumber: BigInt(log.blockNumber),
        eventType: 'APPROVAL' as EventType,
        fromAddress: owner,
        toAddress: spender,
        value: value.toString(),
        gasUsed: null,
        status: 'SUCCESS',
        rawData: toJsonSafe({ token: log.address, owner, spender, allowance: value }),
      })
    }

    if (log.topics[0] === OWNERSHIP_TRANSFERRED_TOPIC) {
      const parsed = ownershipTransferredInterface.parseLog(log)
      if (!parsed) return null
      const [previousOwner, newOwner] = parsed.args as unknown as [string, string]

      return this.monitoringRepository.createEventIfUnseen({
        walletId: wallet.id,
        transactionHash: log.transactionHash,
        blockNumber: BigInt(log.blockNumber),
        eventType: 'OWNERSHIP_TRANSFER' as EventType,
        fromAddress: previousOwner,
        toAddress: newOwner,
        value: '0',
        gasUsed: null,
        status: 'SUCCESS',
        rawData: toJsonSafe({ contract: log.address, previousOwner, newOwner }),
      })
    }

    return null
  }

  private async runEventDetectors(
    event: BlockchainEvent,
    walletAddress: string,
    knownCounterparties: Set<string>,
  ): Promise<void> {
    this.statusService.setPhase('analyzing')
    const context = await this.buildDetectorContext(event, walletAddress, knownCounterparties)

    for (const detector of this.eventDetectors) {
      const result = detector.detect(context)
      if (!result) continue

      this.statusService.setPhase('ai-analysis')
      const analysis = this.aiAnalysisService.analyze(result)
      const { alert } = await this.monitoringRepository.createAlertWithInsight(
        {
          walletId: event.walletId,
          blockchainEventId: event.id,
          severity: result.severity,
          title: result.title,
          description: result.description,
        },
        {
          walletId: event.walletId,
          summary: analysis.summary,
          recommendation: analysis.recommendation,
          confidence: analysis.confidence,
          riskScore: analysis.riskScore,
        },
      )

      await this.notificationsService.notifyForAlert(alert)
    }

    if (event.toAddress) knownCounterparties.add(event.toAddress.toLowerCase())
  }

  private async buildDetectorContext(
    event: BlockchainEvent,
    walletAddress: string,
    knownCounterparties: Set<string>,
  ): Promise<DecodedEventContext> {
    const valueWei = BigInt(event.value)
    const rawData = event.rawData as Record<string, unknown>

    let isNewContractInteraction = false
    if (event.eventType === 'TRANSFER' && event.toAddress && event.toAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      const alreadyKnown = knownCounterparties.has(event.toAddress.toLowerCase())
      if (!alreadyKnown) {
        isNewContractInteraction = await this.ethereumProvider.isContractAddress(event.toAddress)
      }
    }

    return {
      event,
      valueWei,
      approval:
        event.eventType === 'APPROVAL'
          ? { owner: String(rawData.owner), spender: String(rawData.spender), allowance: BigInt(String(rawData.allowance)) }
          : undefined,
      ownershipTransfer:
        event.eventType === 'OWNERSHIP_TRANSFER'
          ? { previousOwner: String(rawData.previousOwner), newOwner: String(rawData.newOwner) }
          : undefined,
      isNewContractInteraction,
    }
  }

  private async checkInactivity(wallet: Wallet): Promise<void> {
    const lastActivityAt = await this.monitoringRepository.getLastEventAt(wallet.id)
    const result = this.walletInactiveDetector.detect(wallet, lastActivityAt)
    if (!result) return

    const recentAlert = await this.alertsService.findLatestByWalletAndTitle(wallet.id, result.title)
    if (recentAlert && Date.now() - recentAlert.createdAt.getTime() < INACTIVITY_ALERT_COOLDOWN_MS) return

    this.statusService.setPhase('ai-analysis')
    const analysis = this.aiAnalysisService.analyze(result)
    const { alert } = await this.monitoringRepository.createAlertWithInsight(
      { walletId: wallet.id, severity: result.severity, title: result.title, description: result.description },
      {
        walletId: wallet.id,
        summary: analysis.summary,
        recommendation: analysis.recommendation,
        confidence: analysis.confidence,
        riskScore: analysis.riskScore,
      },
    )

    await this.notificationsService.notifyForAlert(alert)
  }
}
