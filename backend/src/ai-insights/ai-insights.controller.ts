import { Controller, Get, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload.type'
import { AiInsightsService } from './ai-insights.service'

@ApiTags('ai-insights')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('ai-insights')
export class AiInsightsController {
  constructor(private readonly aiInsightsService: AiInsightsService) {}

  @Get()
  @ApiOperation({ summary: 'List the latest AI-generated insights for the current user' })
  findLatest(@CurrentUser() user: JwtPayload) {
    return this.aiInsightsService.findLatestForUser(user.sub)
  }
}
