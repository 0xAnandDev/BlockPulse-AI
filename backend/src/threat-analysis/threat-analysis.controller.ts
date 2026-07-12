import { Body, Controller, Get, Param, Post, Res, UseGuards } from '@nestjs/common'
import type { Response } from 'express'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../auth/types/jwt-payload.type'
import { WalletsService } from '../wallets/services/wallets.service'
import { ThreatAnalysisService } from './threat-analysis.service'
import { ReportPdfService } from './report-pdf.service'
import { AskAssistantDto } from './dto/ask-assistant.dto'

@ApiTags('threat-analysis')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class ThreatAnalysisController {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly threatAnalysisService: ThreatAnalysisService,
    private readonly reportPdfService: ReportPdfService,
  ) {}

  @Get(':id/security')
  @ApiOperation({ summary: 'Full AI-generated security profile for a wallet' })
  async getSecurity(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    return this.threatAnalysisService.getWalletSecurity(wallet)
  }

  @Get(':id/events')
  @ApiOperation({ summary: "Recent blockchain events for a wallet" })
  async getEvents(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    return this.threatAnalysisService.getEventsForWallet(wallet.id)
  }

  @Get(':id/alerts')
  @ApiOperation({ summary: 'Alerts detected for a wallet' })
  async getAlerts(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    return this.threatAnalysisService.getAlertsForWallet(wallet.id)
  }

  @Get(':id/monitoring-status')
  @ApiOperation({ summary: 'Live monitoring phase, last scanned block, and next-scan countdown for a wallet' })
  async getMonitoringStatus(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    return this.threatAnalysisService.getMonitoringStatus(wallet)
  }

  @Post(':id/assistant')
  @ApiOperation({ summary: 'Ask the AI security assistant a question about this wallet' })
  async askAssistant(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AskAssistantDto) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    return this.threatAnalysisService.askAssistant(wallet, dto.message)
  }

  @Get(':id/report')
  @ApiOperation({ summary: 'Structured security report for a wallet (add ?format=pdf to download a PDF)' })
  async getReport(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Res() res: Response) {
    const wallet = await this.walletsService.findOneForUser(user.sub, id)
    const report = await this.threatAnalysisService.buildReport(wallet)

    const format = res.req.query.format
    if (format === 'pdf') {
      const pdf = await this.reportPdfService.render(report)
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${wallet.walletName.replace(/[^a-z0-9-_]/gi, '_')}-security-report.pdf"`,
      })
      res.send(pdf)
      return
    }

    res.json(report)
  }
}
