import { createParamDecorator, type ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
import type { JwtPayload, JwtPayloadWithRefreshToken } from '../types/jwt-payload.type'

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload | JwtPayloadWithRefreshToken => {
    const request = ctx.switchToHttp().getRequest<Request & { user: JwtPayload | JwtPayloadWithRefreshToken }>()
    return request.user
  },
)
