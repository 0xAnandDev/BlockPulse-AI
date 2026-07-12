import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload.type'
import { AlertsService } from './alerts.service'

@ApiTags('alerts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'List all alerts for the current user' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.alertsService.findAllForUser(user.sub)
  }

  @Get('open')
  @ApiOperation({ summary: 'List only open alerts for the current user' })
  findOpen(@CurrentUser() user: JwtPayload) {
    return this.alertsService.findOpenForUser(user.sub)
  }
}
