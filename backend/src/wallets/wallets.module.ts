import { Module } from '@nestjs/common'
import { WalletsController } from './controllers/wallets.controller'
import { WalletsService } from './services/wallets.service'
import { WalletsRepository } from './repositories/wallets.repository'

@Module({
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepository],
  exports: [WalletsService],
})
export class WalletsModule {}
