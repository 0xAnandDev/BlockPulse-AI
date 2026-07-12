import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export const SUPPORTED_NETWORKS = [
  'Ethereum',
  'Polygon',
  'Base',
  'Arbitrum',
  'Optimism',
  'BNB Chain',
  'Avalanche',
] as const

export class CreateWalletDto {
  @ApiProperty({ example: 'Main Treasury' })
  @IsString()
  @IsNotEmpty({ message: 'Wallet name is required' })
  @MaxLength(120)
  walletName!: string

  @ApiProperty({ example: '0x1234567890abcdef1234567890abcdef12345678' })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{40}$/, { message: 'Enter a valid wallet address (0x...)' })
  walletAddress!: string

  @ApiProperty({ example: 'Ethereum', enum: SUPPORTED_NETWORKS })
  @IsIn(SUPPORTED_NETWORKS, { message: 'Unsupported blockchain network' })
  network!: (typeof SUPPORTED_NETWORKS)[number]

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isMonitoring?: boolean
}
