import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SequelizeModule } from '@nestjs/sequelize';
import { AutoApplyService } from './auto-apply.service.js';
import { User } from '../models/user.model.js';
import { JobApplication } from '../models/job-application.model.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { JobApplicationsModule } from '../job-applications/job-applications.module.js';
import { AiModule } from '../ai/ai.module.js';
import { PlatformAccountsModule } from '../platform-accounts/platform-accounts.module.js';
import { ScrapersModule } from '../scrapers/scrapers.module.js';
import { ResumeGeneratorModule } from '../document-generator/resume-generator.module.js';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    SequelizeModule.forFeature([User, JobApplication]),
    JobsModule,
    JobApplicationsModule,
    AiModule,
    PlatformAccountsModule,
    ScrapersModule,
    ResumeGeneratorModule,
  ],
  providers: [AutoApplyService],
  exports: [AutoApplyService],
})
export class AutoApplyModule {}
