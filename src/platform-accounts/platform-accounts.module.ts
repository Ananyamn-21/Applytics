import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { PlatformAccountsController } from './platform-accounts.controller.js';
import { PlatformAccountsService } from './platform-accounts.service.js';
import { PlatformAccount } from '../models/platform-account.model.js';

@Module({
  imports: [SequelizeModule.forFeature([PlatformAccount])],
  controllers: [PlatformAccountsController],
  providers: [PlatformAccountsService],
  exports: [PlatformAccountsService],
})
export class PlatformAccountsModule {}
