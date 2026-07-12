import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class AskAssistantDto {
  @ApiProperty({ example: 'Why is my wallet considered high risk?' })
  @IsString()
  @IsNotEmpty({ message: 'Message is required' })
  @MaxLength(1000)
  message!: string
}
