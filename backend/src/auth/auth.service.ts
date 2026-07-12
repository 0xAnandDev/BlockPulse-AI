import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import type { User } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import type { JwtPayload } from './types/jwt-payload.type'

const SALT_ROUNDS = 12

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface SafeUser {
  id: string
  fullName: string
  email: string
  role: User['role']
}

function toSafeUser(user: User): SafeUser {
  return { id: user.id, fullName: user.fullName, email: user.email, role: user.role }
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) {
      throw new ConflictException('An account with this email already exists')
    }

    const hashedPassword = await bcrypt.hash(dto.password, SALT_ROUNDS)
    const user = await this.prisma.user.create({
      data: { fullName: dto.fullName, email: dto.email, password: hashedPassword },
    })

    const tokens = await this.issueTokens({ sub: user.id, email: user.email, role: user.role })
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return { user: toSafeUser(user), tokens }
  }

  async login(dto: LoginDto): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordMatches = await bcrypt.compare(dto.password, user.password)
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const tokens = await this.issueTokens({ sub: user.id, email: user.email, role: user.role })
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return { user: toSafeUser(user), tokens }
  }

  async refresh(userId: string, refreshToken: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied')
    }

    const refreshTokenMatches = await bcrypt.compare(refreshToken, user.refreshToken)
    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Access denied')
    }

    const tokens = await this.issueTokens({ sub: user.id, email: user.email, role: user.role })
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return { user: toSafeUser(user), tokens }
  }

  async logout(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    })
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS)
    await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hashedRefreshToken } })
  }

  private async issueTokens(payload: JwtPayload): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ])

    return { accessToken, refreshToken }
  }
}
