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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var LinkedinScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedinScraperService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const base_scraper_service_js_1 = require("./base-scraper.service.js");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
let LinkedinScraperService = LinkedinScraperService_1 = class LinkedinScraperService extends base_scraper_service_js_1.BaseScraperService {
    browser = null;
    async onModuleDestroy() {
        await this.closeBrowser();
    }
    constructor(configService) {
        super(configService, LinkedinScraperService_1.name);
    }
    async getBrowser() {
        if (!this.browser || !this.browser.isConnected()) {
            this.browser = (await puppeteer_extra_1.default.launch({
                headless: false,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-blink-features=AutomationControlled',
                ],
            }));
        }
        return this.browser;
    }
    async loginToLinkedIn(page, email, password) {
        try {
            this.logger.log('Logging into LinkedIn...');
            await page.goto('https://www.linkedin.com/login', {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            await this.randomDelay();
            await page.type('#username', email, { delay: 100 + Math.random() * 200 });
            await this.randomDelay();
            await page.type('#password', password, {
                delay: 100 + Math.random() * 200,
            });
            await this.randomDelay();
            await page.click('[type="submit"]');
            await this.randomDelay();
            await page
                .waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                .catch(() => { });
            const currentUrl = page.url();
            if (currentUrl.includes('/feed') || currentUrl.includes('/jobs')) {
                this.logger.log('LinkedIn login successful');
                return true;
            }
            if (currentUrl.includes('verification') ||
                currentUrl.includes('checkpoint') ||
                (await page.$('#captcha'))) {
                this.logger.warn(`LinkedIn requires 2FA or Captcha. A browser window should currently be open! Please manually solve the 2FA immediately. You have 3 minutes...`);
                try {
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 180000 });
                    const afterSolveUrl = page.url();
                    if (afterSolveUrl.includes('/feed') || afterSolveUrl.includes('/jobs') || afterSolveUrl.includes('/search')) {
                        this.logger.log('LinkedIn login successful after manual Captcha/2FA solve!');
                        return true;
                    }
                }
                catch {
                    this.logger.error('Timed out waiting for manual Captcha/2FA solve (3 minutes elapsed).');
                    return false;
                }
                return false;
            }
            return false;
        }
        catch (error) {
            this.logger.error('LinkedIn login failed', error instanceof Error ? error.stack : error);
            return false;
        }
    }
    async searchJobs(keywords, location, credentials) {
        this.logger.log(`Searching LinkedIn jobs: keywords=${keywords.join(',')}, location=${location}`);
        const jobs = [];
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        try {
            if (credentials.sessionData) {
                try {
                    const sessionData = JSON.parse(credentials.sessionData);
                    if (Array.isArray(sessionData)) {
                        await page.setCookie(...sessionData);
                        this.logger.log('Restored LinkedIn session from cookies');
                    }
                }
                catch {
                    this.logger.warn('Failed to parse session data');
                }
            }
            const loginSuccess = await this.loginToLinkedIn(page, credentials.email, credentials.password);
            if (!loginSuccess) {
                this.logger.error('Failed to login to LinkedIn, skipping search');
                return [];
            }
            const searchQuery = encodeURIComponent(keywords.join(' '));
            const locationParam = location ? encodeURIComponent(location) : '';
            let searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=${locationParam}&f_TPR=r3600&sortBy=DD`;
            searchUrl += '&f_E=1%2C2';
            this.logger.log(`Navigating to: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            await this.randomDelay();
            await this.scrollToLoadJobs(page);
            const scrapedJobs = await page.evaluate(() => {
                const results = [];
                let links = Array.from(document.querySelectorAll('a[href*="/jobs/view/"]'));
                if (links.length === 0) {
                    links = Array.from(document.querySelectorAll('a[href*="/jobs"]'));
                }
                const seen = new Set();
                for (const link of links) {
                    try {
                        const jobUrl = link.href;
                        const idMatch = jobUrl.match(/\/view\/(\d+)/);
                        let externalId = idMatch ? idMatch[1] : null;
                        if (!externalId) {
                            const currentJobIdMatch = jobUrl.match(/currentJobId=(\d+)/);
                            externalId = currentJobIdMatch
                                ? currentJobIdMatch[1]
                                : `linkedin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
                        }
                        if (seen.has(externalId))
                            continue;
                        seen.add(externalId);
                        const card = link.closest('[data-job-id]') ||
                            link.closest('.jobs-search-results__list-item') ||
                            link.closest('.job-card-container') ||
                            link.parentElement;
                        const titleEl = card?.querySelector('.job-card-list__title') ||
                            link.querySelector('span[aria-hidden="true"]') ||
                            link;
                        const companyEl = card?.querySelector('.job-card-container__company-name') ||
                            card?.querySelector('.base-search-card__subtitle') ||
                            card?.querySelector('.artdeco-entity-lockup__subtitle');
                        const locationEl = card?.querySelector('.job-card-container__metadata-item') ||
                            card?.querySelector('.job-search-card__location');
                        const timeEl = card?.querySelector('.job-card-container__listed-time') || card?.querySelector('time');
                        const applicantsEl = card?.querySelector('.job-card-container__applicant-count') ||
                            card?.querySelector('.job-search-card__insight');
                        const title = titleEl?.textContent?.trim() ?? '';
                        const company = companyEl?.textContent?.trim() ?? 'Unknown';
                        const location = locationEl?.textContent?.trim() ?? '';
                        const postedText = timeEl?.textContent?.trim() ?? '';
                        const applicantsText = applicantsEl?.textContent?.trim() ?? '';
                        if (!title)
                            continue;
                        results.push({
                            externalId,
                            title,
                            company,
                            location,
                            jobUrl,
                            postedText,
                            applicantsText,
                        });
                    }
                    catch {
                    }
                }
                return results;
            });
            this.logger.log(`Found ${scrapedJobs.length} raw job cards`);
            for (const item of scrapedJobs) {
                const postedAt = this.parsePostedTime(item.postedText);
                const applicantCount = this.parseApplicantCount(item.applicantsText);
                jobs.push({
                    externalId: item.externalId,
                    title: item.title,
                    company: item.company,
                    location: item.location,
                    jobUrl: item.jobUrl,
                    postedAt,
                    applicantCount,
                });
            }
            const cookies = await page.cookies();
            const sessionData = JSON.stringify(cookies);
            this.logger.log(`Found ${jobs.length} fresh jobs with < 10 applicants`);
            return jobs;
        }
        catch (error) {
            this.logger.error('Error searching LinkedIn jobs', error instanceof Error ? error.stack : error);
            return [];
        }
        finally {
            await page.close();
        }
    }
    async scrollToLoadJobs(page) {
        let previousHeight = 0;
        for (let i = 0; i < 5; i++) {
            const currentHeight = await page.evaluate(() => document.body.scrollHeight);
            if (currentHeight === previousHeight)
                break;
            await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
            await this.randomDelay();
            previousHeight = currentHeight;
        }
    }
    async getTextContent(element) {
        return await element.evaluate((el) => el.textContent.trim());
    }
    parseApplicantCount(text) {
        if (!text)
            return undefined;
        const match = text.match(/(\d+)\s*applicant/);
        return match ? parseInt(match[1], 10) : undefined;
    }
    parsePostedTime(text) {
        const now = new Date();
        if (!text)
            return now;
        const hourMatch = text.match(/(\d+)\s*h/);
        const minMatch = text.match(/(\d+)\s*m/);
        const dayMatch = text.match(/(\d+)\s*d/);
        if (hourMatch) {
            return new Date(now.getTime() - parseInt(hourMatch[1]) * 60 * 60 * 1000);
        }
        else if (minMatch) {
            return new Date(now.getTime() - parseInt(minMatch[1]) * 60 * 1000);
        }
        else if (dayMatch) {
            return new Date(now.getTime() - parseInt(dayMatch[1]) * 24 * 60 * 60 * 1000);
        }
        return now;
    }
    extractJobId(url) {
        const match = url.match(/view\/(\d+)/);
        return match
            ? match[1]
            : `linkedin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async applyToJob(jobUrl, resumeFilePath, credentials) {
        this.logger.log(`Applying to LinkedIn job: ${jobUrl}`);
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        try {
            if (credentials.sessionData) {
                try {
                    const sessionData = JSON.parse(credentials.sessionData);
                    if (Array.isArray(sessionData)) {
                        await page.setCookie(...sessionData);
                    }
                }
                catch { }
            }
            await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
            await this.randomDelay();
            const currentUrl = page.url();
            if (currentUrl.includes('/login') ||
                currentUrl.includes('/authwall') ||
                currentUrl.includes('/checkpoint')) {
                this.logger.warn(`Scraper was redirected from job page to authwall/login at ${currentUrl}. Attempting re-authentication.`);
                const loginSuccess = await this.loginToLinkedIn(page, credentials.email, credentials.password);
                if (!loginSuccess) {
                    return {
                        success: false,
                        error: 'Failed to authenticate for application',
                    };
                }
                await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                await this.randomDelay();
            }
            let easyApplyButton = await page.$('button.jobs-apply-button[aria-label*="Easy Apply"], button.sign-up-modal__outlet');
            if (!easyApplyButton) {
                easyApplyButton = await page.$('button[aria-label*="Easy Apply"]');
            }
            if (!easyApplyButton) {
                let applyButton = await page.$('button.jobs-apply-button[aria-label*="Apply"], .top-card-layout__cta, button[data-modal="job-details-topcard-apply-modal"]');
                if (!applyButton) {
                    applyButton = await page.$('.jobs-apply-button');
                }
                if (!applyButton) {
                    return { success: false, error: 'No apply button found' };
                }
                await applyButton.click();
                await this.randomDelay();
            }
            else {
                await easyApplyButton.click();
                await this.randomDelay();
            }
            const phoneInput = await page.$('input[name*="phone"]');
            if (phoneInput) {
                await this.randomDelay();
            }
            const resumeUpload = await page.$('input[type="file"]');
            if (resumeUpload && resumeFilePath) {
                this.logger.log(`Uploading tailored resume PDF from: ${resumeFilePath}`);
                await resumeUpload.uploadFile(resumeFilePath);
                await this.randomDelay();
            }
            const submitButton = await page.$('button[aria-label*="Submit application"], button[type="submit"]');
            if (submitButton) {
                await submitButton.click();
                await this.randomDelay();
                const pageContent = await page.content();
                if (pageContent.includes('application submitted') ||
                    pageContent.includes('successfully')) {
                    const cookies = await page.cookies();
                    return {
                        success: true,
                        sessionData: JSON.stringify(cookies),
                    };
                }
            }
            return {
                success: false,
                error: 'Could not complete application submission',
            };
        }
        catch (error) {
            this.logger.error('Error applying to LinkedIn job', error instanceof Error ? error.stack : error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
        finally {
            await page.close();
        }
    }
    async closeBrowser() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }
};
exports.LinkedinScraperService = LinkedinScraperService;
exports.LinkedinScraperService = LinkedinScraperService = LinkedinScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LinkedinScraperService);
//# sourceMappingURL=linkedin-scraper.service.js.map