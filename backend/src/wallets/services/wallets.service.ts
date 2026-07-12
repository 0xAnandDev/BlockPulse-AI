import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { WalletsRepository } from '../repositories/wallets.repository'
import { WalletEntity } from '../entities/wallet.entity'
import type { CreateWalletDto } from '../dto/create-wallet.dto'
import type { UpdateWalletDto } from '../dto/update-wallet.dto'

@Injectable()
export class WalletsService {
  constructor(private readonly walletsRepository: WalletsRepository) {}

  async create(userId: string, dto: CreateWalletDto): Promise<WalletEntity> {
    const wallet = await this.walletsRepository.create(userId, dto)
    return new WalletEntity(wallet)
  }

  async findAllForUser(userId: string): Promise<Array<WalletEntity>> {
    const wallets = await this.walletsRepository.findAllByUser(userId)
    return wallets.map((wallet) => new WalletEntity(wallet))
  }

  async findOneForUser(userId: string, id: string): Promise<WalletEntity> {
    const wallet = await this.getOwnedWalletOrThrow(userId, id)
    return new WalletEntity(wallet)
  }

  async update(userId: string, id: string, dto: UpdateWalletDto): Promise<WalletEntity> {
    await this.getOwnedWalletOrThrow(userId, id)
    const updated = await this.walletsRepository.update(id, dto)
    return new WalletEntity(updated)
  }

  async remove(userId: string, id: string): Promise<void> {
    await this.getOwnedWalletOrThrow(userId, id)
    await this.walletsRepository.delete(id)
  }

  private async getOwnedWalletOrThrow(userId: string, id: string) {
    const wallet = await this.walletsRepository.findOneById(id)
    if (!wallet) {
      throw new NotFoundException('Wallet not found')
    }
    if (wallet.userId !== userId) {
      throw new ForbiddenException('You do not have access to this wallet')
    }
    return wallet
  }
}
