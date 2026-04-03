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
var NaukriScraperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NaukriScraperService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const puppeteer_extra_1 = __importDefault(require("puppeteer-extra"));
const puppeteer_extra_plugin_stealth_1 = __importDefault(require("puppeteer-extra-plugin-stealth"));
const base_scraper_service_js_1 = require("./base-scraper.service.js");
puppeteer_extra_1.default.use((0, puppeteer_extra_plugin_stealth_1.default)());
let NaukriScraperService = NaukriScraperService_1 = class NaukriScraperService extends base_scraper_service_js_1.BaseScraperService {
    browser = null;
    async onModuleDestroy() {
        await this.closeBrowser();
    }
    constructor(configService) {
        super(configService, NaukriScraperService_1.name);
    }
    async getBrowser() {
        if (!this.browser || !this.browser.isConnected()) {
            this.browser = (await puppeteer_extra_1.default.launch({
                headless: true,
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
    async loginToNaukri(page, email, password) {
        try {
            this.logger.log('Logging into Naukri...');
            await page.goto('https://www.naukri.com/nlogin/login', {
                waitUntil: 'networkidle2',
                timeout: 30000,
            });
            await this.randomDelay();
            await page.type('#usernameField', email, {
                delay: 100 + Math.random() * 200,
            });
            await this.randomDelay();
            await page.type('#passwordField', password, {
                delay: 100 + Math.random() * 200,
            });
            await this.randomDelay();
            await page.click('.loginButton');
            await this.randomDelay();
            await page
                .waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
                .catch(() => { });
            const currentUrl = page.url();
            if (!currentUrl.includes('nlogin')) {
                this.logger.log('Naukri login successful');
                return true;
            }
            return false;
        }
        catch (error) {
            this.logger.error('Naukri login failed', error instanceof Error ? error.stack : error);
            return false;
        }
    }
    async searchJobs(keywords, location, credentials) {
        this.logger.log(`Searching Naukri jobs: keywords=${keywords.join(',')}, location=${location}`);
        const jobs = [];
        const browser = await this.getBrowser();
        const page = await browser.newPage();
        try {
            if (credentials.sessionData) {
                try {
                    const sessionData = JSON.parse(credentials.sessionData);
                    if (Array.isArray(sessionData)) {
                        await page.setCookie(...sessionData);
                        this.logger.log('Restored Naukri session from cookies');
                    }
                }
                catch {
                    this.logger.warn('Failed to parse session data');
                }
            }
            const loginSuccess = await this.loginToNaukri(page, credentials.email, credentials.password);
            if (!loginSuccess) {
                this.logger.error('Failed to login to Naukri, skipping search');
                return [];
            }
            const searchQuery = encodeURIComponent(keywords.join(' '));
            const locationParam = location ? encodeURIComponent(location) : 'india';
            const searchUrl = `https://www.naukri.com/jobs-in-${locationParam}?k=${searchQuery}&l=${locationParam}&freshness=1`;
            this.logger.log(`Navigating to: ${searchUrl}`);
            await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
            await this.randomDelay();
            await this.scrollToLoadJobs(page);
            const jobCards = await page.$$('.jobTuple');
            this.logger.log(`Found ${jobCards.length} job cards`);
            for (const card of jobCards.slice(0, 30)) {
                try {
                    const titleEl = await card.$('.title');
                    const companyEl = await card.$('.companyInfo .subTitle');
                    const locationEl = await card.$('.location');
                    const linkEl = await card.$('.title a');
                    const timeEl = await card.$('.tags .tag');
                    const applicantsEl = await card.$('.tags .applicants');
                    if (!titleEl || !linkEl)
                        continue;
                    const title = await this.getTextContent(titleEl);
                    const company = companyEl
                        ? await this.getTextContent(companyEl)
                        : 'Unknown';
                    const location = locationEl
                        ? await this.getTextContent(locationEl)
                        : '';
                    const jobUrl = await page.evaluate((el) => el.href, linkEl);
                    const postedTime = timeEl ? await this.getTextContent(timeEl) : '';
                    const applicantsText = applicantsEl
                        ? await this.getTextContent(applicantsEl)
                        : '';
                    const applicantCount = this.parseApplicantCount(applicantsText);
                    const postedAt = this.parsePostedTime(postedTime);
                    const age = Date.now() - postedAt.getTime();
                    if (age > 60 * 60 * 1000)
                        continue;
                    if (applicantCount && applicantCount > 10)
                        continue;
                    const externalId = this.extractJobId(jobUrl);
                    jobs.push({
                        externalId,
                        title,
                        company,
                        location,
                        jobUrl,
                        postedAt,
                        applicantCount,
                    });
                }
                catch {
                    this.logger.warn('Error parsing job card');
                }
            }
            const cookies = await page.cookies();
            const sessionData = JSON.stringify(cookies);
            this.logger.log(`Found ${jobs.length} fresh jobs with < 10 applicants`);
            return jobs;
        }
        catch (error) {
            this.logger.error('Error searching Naukri jobs', error instanceof Error ? error.stack : error);
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
        const hourMatch = text.match(/(\d+)\s*hour/i);
        const minMatch = text.match(/(\d+)\s*min/i);
        const dayMatch = text.match(/(\d+)\s*day/i);
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
        const match = url.match(/\/job-listings\/([^/]+)/);
        return match
            ? match[1]
            : `naukri-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async applyToJob(jobUrl, resumeFilePath, credentials) {
        this.logger.log(`Applying to Naukri job: ${jobUrl}`);
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
            const applyButton = await page.$('.apply-button, .apply-button-wrap .apply-button, button.apply-button');
            if (!applyButton) {
                const applyLink = await page.$('a[href*="apply"], .apply-button-link');
                if (!applyLink) {
                    return { success: false, error: 'No apply button found' };
                }
                await applyLink.click();
            }
            else {
                await applyButton.click();
            }
            await this.randomDelay();
            const resumeUpload = await page.$('input[type="file"], input[name="resume"]');
            if (resumeUpload && resumeFilePath) {
                this.logger.log(`Uploading tailored resume PDF to Naukri from: ${resumeFilePath}`);
                await resumeUpload.uploadFile(resumeFilePath);
                await this.randomDelay();
            }
            await this.randomDelay();
            const pages = await browser.pages();
            if (pages.length > 2) {
                await pages[pages.length - 1].bringToFront();
            }
            const pageContent = await page.content();
            if (pageContent.includes('applied successfully') ||
                pageContent.includes('Application Submitted')) {
                const cookies = await page.cookies();
                return {
                    success: true,
                    sessionData: JSON.stringify(cookies),
                };
            }
            if (!page.url().includes('naukri.com')) {
                return {
                    success: true,
                    sessionData: JSON.stringify(await page.cookies()),
                    error: 'Redirected to company site - manual apply required',
                };
            }
            return { success: false, error: 'Could not complete application' };
        }
        catch (error) {
            this.logger.error('Error applying to Naukri job', error instanceof Error ? error.stack : error);
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
exports.NaukriScraperService = NaukriScraperService;
exports.NaukriScraperService = NaukriScraperService = NaukriScraperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], NaukriScraperService);
//# sourceMappingURL=naukri-scraper.service.js.map