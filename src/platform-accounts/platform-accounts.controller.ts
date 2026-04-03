import {
  Controller,
  Get,
  Post,
  Delete,
  Put,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { PlatformAccountsService } from './platform-accounts.service.js';
import { LinkAccountDto } from './dto/link-account.dto.js';

@Controller('platform-accounts')
@UseGuards(JwtAuthGuard)
export class PlatformAccountsController {
  constructor(
    private readonly platformAccountsService: PlatformAccountsService,
  ) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.platformAccountsService.findAllByUser(userId);
  }

  @Post('link')
  link(@CurrentUser('id') userId: string, @Body() dto: LinkAccountDto) {
    return this.platformAccountsService.linkAccount(userId, dto);
  }

  @Delete(':id/unlink')
  unlink(@CurrentUser('id') userId: string, @Param('id') accountId: string) {
    return this.platformAccountsService.unlinkAccount(userId, accountId);
  }

  @Put(':id/pause')
  pause(@CurrentUser('id') userId: string, @Param('id') accountId: string) {
    return this.platformAccountsService.pauseAccount(userId, accountId);
  }

  @Put(':id/resume')
  resume(@CurrentUser('id') userId: string, @Param('id') accountId: string) {
    return this.platformAccountsService.resumeAccount(userId, accountId);
  }
}
