import { Global, Module } from '@nestjs/common'
import { EthereumProviderService } from './ethereum-provider.service'

@Global()
@Module({
  providers: [EthereumProviderService],
  exports: [EthereumProviderService],
})
export class EthereumModule {}
