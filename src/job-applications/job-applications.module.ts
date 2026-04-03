import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JobApplicationsController } from './job-applications.controller.js';
import { JobApplicationsService } from './job-applications.service.js';
import { JobApplication } from '../models/job-application.model.js';

@Module({
  imports: [SequelizeModule.forFeature([JobApplication])],
  controllers: [JobApplicationsController],
  providers: [JobApplicationsService],
  exports: [JobApplicationsService],
})
export class JobApplicationsModule {}
