import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobPreferencesController } from './job-preferences.controller.js';
import { JobPreferencesService } from './job-preferences.service.js';
import { JobPreference } from '../models/job-preference.model.js';

@Module({
  imports: [SequelizeModule.forFeature([JobPreference])],
  controllers: [JobPreferencesController],
  providers: [JobPreferencesService],
  exports: [JobPreferencesService],
})
export class JobPreferencesModule {}
