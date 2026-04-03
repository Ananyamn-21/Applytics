"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AutoApplyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoApplyService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const schedule_1 = require("@nestjs/schedule");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const user_model_js_1 = require("../models/user.model.js");
const user_profile_model_js_1 = require("../models/user-profile.model.js");
const skill_model_js_1 = require("../models/skill.model.js");
const job_preference_model_js_1 = require("../models/job-preference.model.js");
const platform_account_model_js_1 = require("../models/platform-account.model.js");
const job_application_model_js_1 = require("../models/job-application.model.js");
const jobs_service_js_1 = require("../jobs/jobs.service.js");
const job_applications_service_js_1 = require("../job-applications/job-applications.service.js");
const ai_service_js_1 = require("../ai/ai.service.js");
const platform_accounts_service_js_1 = require("../platform-accounts/platform-accounts.service.js");
const linkedin_scraper_service_js_1 = require("../scrapers/linkedin-scraper.service.js");
const naukri_scraper_service_js_1 = require("../scrapers/naukri-scraper.service.js");
const job_model_js_1 = require("../models/job.model.js");
const resume_generator_service_js_1 = require("../document-generator/resume-generator.service.js");
const ioredis_1 = __importDefault(require("ioredis"));
const redlock_1 = __importDefault(require("redlock"));
let AutoApplyService = AutoApplyService_1 = class AutoApplyService {
    userModel;
    jobApplicationModel;
    configService;
    jobsService;
    jobApplicationsService;
    aiService;
    platformAccountsService;
    linkedinScraper;
    naukriScraper;
    resumeGenerator;
    logger = new common_1.Logger(AutoApplyService_1.name);
    maxPerHour;
    maxPerDay;
    redlock;
    redisClient;
    constructor(userModel, jobApplicationModel, configService, jobsService, jobApplicationsService, aiService, platformAccountsService, linkedinScraper, naukriScraper, resumeGenerator) {
        this.userModel = userModel;
        this.jobApplicationModel = jobApplicationModel;
        this.configService = configService;
        this.jobsService = jobsService;
        this.jobApplicationsService = jobApplicationsService;
        this.aiService = aiService;
        this.platformAccountsService = platformAccountsService;
        this.linkedinScraper = linkedinScraper;
        this.naukriScraper = naukriScraper;
        this.resumeGenerator = resumeGenerator;
        this.maxPerHour = this.configService.get('autoApply.maxApplicationsPerHour');
        this.maxPerDay = this.configService.get('autoApply.maxApplicationsPerDay');
        const redisUrl = this.configService.get('redis.url') || 'redis://localhost:6379';
        this.redisClient = new ioredis_1.default(redisUrl);
        this.redlock = new redlock_1.default([this.redisClient], {
            drillDown: false,
            retryCount: 0,
        });
    }
    async runAutoApply() {
        let lock;
        try {
            lock = await this.redlock.acquire(['auto-apply-lock'], 4 * 60 * 1000);
        }
        catch {
            this.logger.debug('Auto-apply already running on another instance, skipping...');
            return;
        }
        this.logger.log('Starting auto-apply cycle...');
        try {
            const users = await this.getActiveUsers();
            this.logger.log(`Found ${users.length} active users to process`);
            for (const user of users) {
                await this.processUser(user);
            }
        }
        catch (error) {
            this.logger.error('Auto-apply cycle failed', error instanceof Error ? error.stack : error);
        }
        finally {
            if (lock) {
                await lock
                    .release()
                    .catch((e) => this.logger.error('Failed to release lock', e));
            }
            this.logger.log('Auto-apply cycle completed');
        }
    }
    async getActiveUsers() {
        return this.userModel.findAll({
            where: { isActive: true },
            include: [
                { model: user_profile_model_js_1.UserProfile, where: { resumeText: { [sequelize_2.Op.ne]: null } } },
                { model: skill_model_js_1.Skill },
                { model: job_preference_model_js_1.JobPreference, where: { isActive: true } },
                {
                    model: platform_account_model_js_1.PlatformAccount,
                    where: { status: platform_account_model_js_1.AccountStatus.ACTIVE, isConnected: true },
                },
            ],
        });
    }
    async processUser(user) {
        this.logger.log(`Processing user: ${user.email}`);
        const hourlyCount = await this.getHourlyApplicationCount(user.id);
        const dailyCount = await this.getDailyApplicationCount(user.id);
        if (hourlyCount >= this.maxPerHour) {
            this.logger.debug(`User ${user.email}: hourly limit reached (${hourlyCount}/${this.maxPerHour})`);
            return;
        }
        if (dailyCount >= this.maxPerDay) {
            this.logger.debug(`User ${user.email}: daily limit reached (${dailyCount}/${this.maxPerDay})`);
            return;
        }
        const remainingHourly = this.maxPerHour - hourlyCount;
        const remainingDaily = this.maxPerDay - dailyCount;
        const maxApplications = Math.min(remainingHourly, remainingDaily);
        for (const account of user.platformAccounts) {
            const scraper = this.getScraperForPlatform(account.platform);
            if (!scraper)
                continue;
            const credentials = await this.platformAccountsService.getDecryptedCredentials(user.id, account.platform);
            if (!credentials)
                continue;
            for (const preference of user.jobPreferences) {
                await this.searchAndApply(user, account, preference, scraper, credentials, maxApplications);
            }
        }
    }
    async searchAndApply(user, account, preference, scraper, credentials, maxApplications) {
        try {
            const scrapedJobs = await scraper.searchJobs([preference.role, ...(preference.keywords || [])], preference.location || undefined, credentials);
            this.logger.log(`Found ${scrapedJobs.length} jobs for preference: ${preference.role} on ${account.platform}`);
            let applied = 0;
            const platform = account.platform === platform_account_model_js_1.Platform.LINKEDIN
                ? job_model_js_1.JobPlatform.LINKEDIN
                : job_model_js_1.JobPlatform.NAUKRI;
            for (const scrapedJob of scrapedJobs) {
                if (applied >= maxApplications)
                    break;
                const postedAge = Date.now() - scrapedJob.postedAt.getTime();
                if (postedAge > 60 * 60 * 1000)
                    continue;
                if (scrapedJob.applicantCount && scrapedJob.applicantCount > 10)
                    continue;
                const job = await this.jobsService.upsertJob({
                    ...scrapedJob,
                    platform,
                });
                const alreadyApplied = await this.jobApplicationsService.hasApplied(user.id, job.id);
                if (alreadyApplied)
                    continue;
                const skills = user.skills.map((s) => s.name);
                const matchScore = await this.aiService.scoreJobMatch(user.profile.resumeText || '', skills, { role: preference.role, keywords: preference.keywords || [] }, job.title, job.description || '');
                if (matchScore.score < 50) {
                    this.logger.debug(`Skipping job ${job.title} at ${job.company} - low match score: ${matchScore.score}`);
                    continue;
                }
                const tailoredResume = await this.aiService.tailorResume(user.profile.resumeText || '', job.title, job.description || '', skills);
                const pdfPath = await this.resumeGenerator.generatePdfResume(user, job, tailoredResume);
                const result = await scraper.applyToJob(job.jobUrl, pdfPath || tailoredResume?.summary || user.profile.resumeText || '', credentials);
                if (result.success) {
                    await this.jobApplicationsService.createApplication({
                        userId: user.id,
                        jobId: job.id,
                        tailoredResumeText: tailoredResume?.summary || user.profile.resumeText || '',
                        tailoredResumeUrl: pdfPath || undefined,
                        notes: `Match score: ${matchScore.score}. Highlights: ${tailoredResume?.highlights?.join(', ') || ''}`,
                    });
                    if (result.sessionData) {
                        await this.platformAccountsService.updateSessionData(account.id, result.sessionData);
                    }
                    applied++;
                    this.logger.log(`Applied to: ${job.title} at ${job.company} (score: ${matchScore.score})`);
                }
                else if (result.error) {
                    this.logger.warn(`Failed to apply to ${job.title}: ${result.error}`);
                    if (result.error.includes('captcha') ||
                        result.error.includes('suspended') ||
                        result.error.includes('blocked')) {
                        this.logger.error(`Account safety issue detected for ${account.platform}, pausing account`);
                        await this.platformAccountsService.markError(account.id);
                        return;
                    }
                }
            }
        }
        catch (error) {
            this.logger.error(`Error in search and apply for ${account.platform}`, error instanceof Error ? error.stack : error);
        }
    }
    getScraperForPlatform(platform) {
        switch (platform) {
            case platform_account_model_js_1.Platform.LINKEDIN:
                return this.linkedinScraper;
            case platform_account_model_js_1.Platform.NAUKRI:
                return this.naukriScraper;
            default:
                return null;
        }
    }
    async getHourlyApplicationCount(userId) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.jobApplicationModel.count({
            where: {
                userId,
                appliedAt: { [sequelize_2.Op.gte]: hourAgo },
            },
        });
    }
    async getDailyApplicationCount(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.jobApplicationModel.count({
            where: {
                userId,
                appliedAt: { [sequelize_2.Op.gte]: today },
            },
        });
    }
};
exports.AutoApplyService = AutoApplyService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_5_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AutoApplyService.prototype, "runAutoApply", null);
exports.AutoApplyService = AutoApplyService = AutoApplyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(user_model_js_1.User)),
    __param(1, (0, sequelize_1.InjectModel)(job_application_model_js_1.JobApplication)),
    __metadata("design:paramtypes", [Object, Object, config_1.ConfigService,
        jobs_service_js_1.JobsService,
        job_applications_service_js_1.JobApplicationsService,
        ai_service_js_1.AiService,
        platform_accounts_service_js_1.PlatformAccountsService,
        linkedin_scraper_service_js_1.LinkedinScraperService,
        naukri_scraper_service_js_1.NaukriScraperService,
        resume_generator_service_js_1.ResumeGeneratorService])
], AutoApplyService);
//# sourceMappingURL=auto-apply.service.js.map