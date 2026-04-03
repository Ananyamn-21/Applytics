import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AppConfigModule } from './config/config.module.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { SkillsModule } from './skills/skills.module.js';
import { JobPreferencesModule } from './job-preferences/job-preferences.module.js';
import { PlatformAccountsModule } from './platform-accounts/platform-accounts.module.js';
import { AiModule } from './ai/ai.module.js';
import { JobsModule } from './jobs/jobs.module.js';
import { JobApplicationsModule } from './job-applications/job-applications.module.js';
import { AutoApplyModule } from './auto-apply/auto-apply.module.js';
import { DashboardModule } from './dashboard/dashboard.module.js';
import { ScrapersModule } from './scrapers/scrapers.module.js';
import { ResumeGeneratorModule } from './document-generator/resume-generator.module.js';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    SkillsModule,
    JobPreferencesModule,
    PlatformAccountsModule,
    AiModule,
    JobsModule,
    JobApplicationsModule,
    AutoApplyModule,
    DashboardModule,
    ScrapersModule,
    ResumeGeneratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
