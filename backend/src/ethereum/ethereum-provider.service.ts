import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Interface, JsonRpcProvider } from 'ethers'
import type { Block, Log, TransactionReceipt } from 'ethers'

const DEFAULT_SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com'

/** Minimal ABIs — only the event signatures the detectors need to decode. */
export const ERC20_APPROVAL_ABI = ['event Approval(address indexed owner, address indexed spender, uint256 value)']
export const OWNERSHIP_TRANSFERRED_ABI = [
  'event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)',
]

export const erc20ApprovalInterface = new Interface(ERC20_APPROVAL_ABI)
export const ownershipTransferredInterface = new Interface(OWNERSHIP_TRANSFERRED_ABI)

export const APPROVAL_TOPIC = erc20ApprovalInterface.getEvent('Approval')!.topicHash
export const OWNERSHIP_TRANSFERRED_TOPIC = ownershipTransferredInterface.getEvent('OwnershipTransferred')!.topicHash

@Injectable()
export class EthereumProviderService {
  private readonly logger = new Logger(EthereumProviderService.name)
  private readonly provider: JsonRpcProvider

  constructor(private readonly configService: ConfigService) {
    const rpcUrl = this.configService.get<string>('SEPOLIA_RPC_URL') || DEFAULT_SEPOLIA_RPC_URL
    this.provider = new JsonRpcProvider(rpcUrl, 'sepolia')
    this.logger.log(`Connected to Ethereum Sepolia via ${rpcUrl}`)
  }

  getProvider(): JsonRpcProvider {
    return this.provider
  }

  getLatestBlockNumber(): Promise<number> {
    return this.provider.getBlockNumber()
  }

  getBlockWithTransactions(blockNumber: number): Promise<Block | null> {
    return this.provider.getBlock(blockNumber, true)
  }

  getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
    return this.provider.getTransactionReceipt(txHash)
  }

  async isContractAddress(address: string): Promise<boolean> {
    const code = await this.provider.getCode(address)
    return code !== '0x'
  }

  getLogsInRange(fromBlock: number, toBlock: number, topics: Array<string>): Promise<Array<Log>> {
    return this.provider.getLogs({ fromBlock, toBlock, topics: [topics] })
  }
}
