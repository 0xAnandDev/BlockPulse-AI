import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'ada@blockpulse.ai' })
  @IsEmail({}, { message: 'Enter a valid email address' })
  email!: string

  @ApiProperty({ example: 'Str0ng!Passw0rd' })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password!: string
}
