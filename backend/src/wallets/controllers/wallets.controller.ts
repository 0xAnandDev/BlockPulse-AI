import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard'
import { CurrentUser } from '../../auth/decorators/current-user.decorator'
import type { JwtPayload } from '../../auth/types/jwt-payload.type'
import { WalletsService } from '../services/wallets.service'
import { CreateWalletDto } from '../dto/create-wallet.dto'
import { UpdateWalletDto } from '../dto/update-wallet.dto'

@ApiTags('wallets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a wallet to monitor' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWalletDto) {
    return this.walletsService.create(user.sub, dto)
  }

  @Get()
  @ApiOperation({ summary: "List the current user's wallets" })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.walletsService.findAllForUser(user.sub)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single wallet by id' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.walletsService.findOneForUser(user.sub, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a wallet (name, network, monitoring state)' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateWalletDto) {
    return this.walletsService.update(user.sub, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a wallet' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.walletsService.remove(user.sub, id)
  }
}
