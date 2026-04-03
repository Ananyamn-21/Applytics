/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/user-profile.model.js';
import { Skill } from '../models/skill.model.js';
import { JobPreference } from '../models/job-preference.model.js';
import {
  PlatformAccount,
  Platform,
  AccountStatus,
} from '../models/platform-account.model.js';
import { JobApplication } from '../models/job-application.model.js';
import { JobsService } from '../jobs/jobs.service.js';
import { JobApplicationsService } from '../job-applications/job-applications.service.js';
import { AiService } from '../ai/ai.service.js';
import { PlatformAccountsService } from '../platform-accounts/platform-accounts.service.js';
import {
  LinkedinScraperService,
  LinkedInCredentials,
} from '../scrapers/linkedin-scraper.service.js';
import {
  NaukriScraperService,
  NaukriCredentials,
} from '../scrapers/naukri-scraper.service.js';
import { BaseScraperService } from '../scrapers/base-scraper.service.js';
import { JobPlatform } from '../models/job.model.js';
import { ResumeGeneratorService } from '../document-generator/resume-generator.service.js';
import Redis from 'ioredis';
import Redlock from 'redlock';

@Injectable()
export class AutoApplyService {
  private readonly logger = new Logger(AutoApplyService.name);
  private readonly maxPerHour: number;
  private readonly maxPerDay: number;
  private redlock: Redlock;
  private redisClient: Redis;

  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    @InjectModel(JobApplication)
    private readonly jobApplicationModel: typeof JobApplication,
    private readonly configService: ConfigService,
    private readonly jobsService: JobsService,
    private readonly jobApplicationsService: JobApplicationsService,
    private readonly aiService: AiService,
    private readonly platformAccountsService: PlatformAccountsService,
    private readonly linkedinScraper: LinkedinScraperService,
    private readonly naukriScraper: NaukriScraperService,
    private readonly resumeGenerator: ResumeGeneratorService,
  ) {
    this.maxPerHour = this.configService.get<number>(
      'autoApply.maxApplicationsPerHour',
    )!;
    this.maxPerDay = this.configService.get<number>(
      'autoApply.maxApplicationsPerDay',
    )!;

    // Initialize Redis and Redlock for distributed execution preventing race conditions
    const redisUrl =
      this.configService.get<string>('redis.url') || 'redis://localhost:6379';
    this.redisClient = new Redis(redisUrl);

    this.redlock = new Redlock([this.redisClient], {
      drillDown: false,
      retryCount: 0,
    });
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async runAutoApply() {
    let lock;
    try {
      lock = await this.redlock.acquire(['auto-apply-lock'], 4 * 60 * 1000); // 4 minute lock
    } catch {
      this.logger.debug(
        'Auto-apply already running on another instance, skipping...',
      );
      return;
    }

    this.logger.log('Starting auto-apply cycle...');

    try {
      const users = await this.getActiveUsers();
      this.logger.log(`Found ${users.length} active users to process`);

      for (const user of users) {
        await this.processUser(user);
      }
    } catch (error) {
      this.logger.error(
        'Auto-apply cycle failed',
        error instanceof Error ? error.stack : error,
      );
    } finally {
      if (lock) {
        await lock
          .release()

          .catch((e: Error) => this.logger.error('Failed to release lock', e));
      }
      this.logger.log('Auto-apply cycle completed');
    }
  }

  private async getActiveUsers(): Promise<User[]> {
    return this.userModel.findAll({
      where: { isActive: true },
      include: [
        { model: UserProfile, where: { resumeText: { [Op.ne]: null } } },
        { model: Skill },
        { model: JobPreference, where: { isActive: true } },
        {
          model: PlatformAccount,
          where: { status: AccountStatus.ACTIVE, isConnected: true },
        },
      ],
    });
  }

  private async processUser(user: User) {
    this.logger.log(`Processing user: ${user.email}`);

    const hourlyCount = await this.getHourlyApplicationCount(user.id);
    const dailyCount = await this.getDailyApplicationCount(user.id);

    if (hourlyCount >= this.maxPerHour) {
      this.logger.debug(
        `User ${user.email}: hourly limit reached (${hourlyCount}/${this.maxPerHour})`,
      );
      return;
    }
    if (dailyCount >= this.maxPerDay) {
      this.logger.debug(
        `User ${user.email}: daily limit reached (${dailyCount}/${this.maxPerDay})`,
      );
      return;
    }

    const remainingHourly = this.maxPerHour - hourlyCount;
    const remainingDaily = this.maxPerDay - dailyCount;
    const maxApplications = Math.min(remainingHourly, remainingDaily);

    for (const account of user.platformAccounts) {
      const scraper = this.getScraperForPlatform(account.platform);
      if (!scraper) continue;

      const credentials =
        await this.platformAccountsService.getDecryptedCredentials(
          user.id,
          account.platform,
        );
      if (!credentials) continue;

      for (const preference of user.jobPreferences) {
        await this.searchAndApply(
          user,
          account,
          preference,
          scraper,
          credentials,
          maxApplications,
        );
      }
    }
  }

  private async searchAndApply(
    user: User,
    account: PlatformAccount,
    preference: JobPreference,
    scraper: BaseScraperService,
    credentials: LinkedInCredentials | NaukriCredentials,
    maxApplications: number,
  ) {
    try {
      const scrapedJobs = await scraper.searchJobs(
        [preference.role, ...(preference.keywords || [])],
        preference.location || undefined,
        credentials,
      );

      this.logger.log(
        `Found ${scrapedJobs.length} jobs for preference: ${preference.role} on ${account.platform}`,
      );

      let applied = 0;
      const platform =
        account.platform === Platform.LINKEDIN
          ? JobPlatform.LINKEDIN
          : JobPlatform.NAUKRI;

      for (const scrapedJob of scrapedJobs) {
        if (applied >= maxApplications) break;

        const postedAge = Date.now() - scrapedJob.postedAt.getTime();
        if (postedAge > 60 * 60 * 1000) continue;

        if (scrapedJob.applicantCount && scrapedJob.applicantCount > 10)
          continue;

        const job = await this.jobsService.upsertJob({
          ...scrapedJob,
          platform,
        });

        const alreadyApplied = await this.jobApplicationsService.hasApplied(
          user.id,
          job.id,
        );
        if (alreadyApplied) continue;

        const skills = user.skills.map((s) => s.name);
        const matchScore = await this.aiService.scoreJobMatch(
          user.profile.resumeText || '',
          skills,
          { role: preference.role, keywords: preference.keywords || [] },
          job.title,
          job.description || '',
        );

        if (matchScore.score < 50) {
          this.logger.debug(
            `Skipping job ${job.title} at ${job.company} - low match score: ${matchScore.score}`,
          );
          continue;
        }

        const tailoredResume = await this.aiService.tailorResume(
          user.profile.resumeText || '',
          job.title,
          job.description || '',
          skills,
        );

        const pdfPath = await this.resumeGenerator.generatePdfResume(
          user,
          job,
          tailoredResume,
        );

        const result = await scraper.applyToJob(
          job.jobUrl,
          pdfPath || tailoredResume?.summary || user.profile.resumeText || '',
          credentials,
        );

        if (result.success) {
          await this.jobApplicationsService.createApplication({
            userId: user.id,
            jobId: job.id,
            tailoredResumeText:
              tailoredResume?.summary || user.profile.resumeText || '',
            tailoredResumeUrl: pdfPath || undefined, // Store for user download
            notes: `Match score: ${matchScore.score}. Highlights: ${tailoredResume?.highlights?.join(', ') || ''}`,
          });

          if (result.sessionData) {
            await this.platformAccountsService.updateSessionData(
              account.id,
              result.sessionData,
            );
          }

          applied++;
          this.logger.log(
            `Applied to: ${job.title} at ${job.company} (score: ${matchScore.score})`,
          );
        } else if (result.error) {
          this.logger.warn(`Failed to apply to ${job.title}: ${result.error}`);

          if (
            result.error.includes('captcha') ||
            result.error.includes('suspended') ||
            result.error.includes('blocked')
          ) {
            this.logger.error(
              `Account safety issue detected for ${account.platform}, pausing account`,
            );
            await this.platformAccountsService.markError(account.id);
            return;
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error in search and apply for ${account.platform}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private getScraperForPlatform(platform: Platform): BaseScraperService | null {
    switch (platform) {
      case Platform.LINKEDIN:
        return this.linkedinScraper;
      case Platform.NAUKRI:
        return this.naukriScraper;
      default:
        return null;
    }
  }

  private async getHourlyApplicationCount(userId: string): Promise<number> {
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    return this.jobApplicationModel.count({
      where: {
        userId,
        appliedAt: { [Op.gte]: hourAgo },
      },
    });
  }

  private async getDailyApplicationCount(userId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.jobApplicationModel.count({
      where: {
        userId,
        appliedAt: { [Op.gte]: today },
      },
    });
  }
}
