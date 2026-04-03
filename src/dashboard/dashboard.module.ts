import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { DashboardController } from './dashboard.controller.js';
import { DashboardService } from './dashboard.service.js';
import { JobApplication } from '../models/job-application.model.js';
import { PlatformAccount } from '../models/platform-account.model.js';
import { JobPreference } from '../models/job-preference.model.js';

@Module({
  imports: [
    SequelizeModule.forFeature([
      JobApplication,
      PlatformAccount,
      JobPreference,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
