import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import type { Request } from 'express'
import type { JwtPayload, JwtPayloadWithRefreshToken } from '../types/jwt-payload.type'

function extractRefreshTokenFromCookie(req: Request): string | null {
  return req?.cookies?.refreshToken ?? null
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: extractRefreshTokenFromCookie,
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    })
  }

  validate(req: Request, payload: JwtPayload): JwtPayloadWithRefreshToken {
    const refreshToken = extractRefreshTokenFromCookie(req)
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing from request')
    }
    return { ...payload, refreshToken }
  }
}
