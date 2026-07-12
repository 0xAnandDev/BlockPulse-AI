import { Body, Controller, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import type { JwtPayloadWithRefreshToken } from './types/jwt-payload.type'

const REFRESH_TOKEN_COOKIE = 'refreshToken'
const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

function setRefreshTokenCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: '/auth',
  })
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Create a new account' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.register(dto)
    setRefreshTokenCookie(res, tokens.refreshToken)
    return { user, accessToken: tokens.accessToken }
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.login(dto)
    setRefreshTokenCookie(res, tokens.refreshToken)
    return { user, accessToken: tokens.accessToken }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the access token using the refresh token cookie' })
  async refresh(
    @CurrentUser() currentUser: JwtPayloadWithRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.refresh(currentUser.sub, currentUser.refreshToken)
    setRefreshTokenCookie(res, tokens.refreshToken)
    return { user, accessToken: tokens.accessToken }
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Log out and revoke the refresh token' })
  async logout(
    @CurrentUser() currentUser: JwtPayloadWithRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(currentUser.sub)
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/auth' })
  }
}
