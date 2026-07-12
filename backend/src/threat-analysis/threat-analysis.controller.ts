import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload.type'
import { WalletsService } from '../wallets/services/wallets.service'
import { ThreatAnalysisService } from './threat-analysis.service'

@ApiTags('threat-analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class ThreatAnalysisController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly threatAnalysisService: ThreatAnalysisService,
  ) {}

  @Get(':id/security')
  @ApiOperation({ summary: 'Full AI-generated security profile for a wallet' })
  async getSecurity(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    return this.threatAnalysisService.getWalletSecurity(wallet)
  }
}
