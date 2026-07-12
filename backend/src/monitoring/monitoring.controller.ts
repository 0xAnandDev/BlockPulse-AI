import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload.type'
import { MonitoringService } from './monitoring.service'

@ApiTags('monitoring')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('monitoring')
export class MonitoringController {
  constructor(private readonly monitoringService: MonitoringService) {}

  @Get('events')
  @ApiOperation({ summary: 'List the latest blockchain events for the current user' })
  findLatestEvents(@CurrentUser() user: JwtPayload) {
    return this.monitoringService.findLatestEventsForUser(user.sub)
  }
}
