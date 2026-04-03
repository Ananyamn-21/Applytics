/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-empty */
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { Page, Browser } from 'puppeteer';
import { BaseScraperService, ScrapedJob } from './base-scraper.service.js';

puppeteer.use(StealthPlugin());

export interface NaukriCredentials {
  email: string;
  password: string;
  sessionData: string | null;
}

@Injectable()
export class NaukriScraperService
  extends BaseScraperService
  implements OnModuleDestroy
{
  private browser: Browser | null = null;

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  constructor(configService: ConfigService) {
    super(configService, NaukriScraperService.name);
  }

  private async getBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = (await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-blink-features=AutomationControlled',
        ],
      })) as unknown as Browser;
    }
    return this.browser;
  }

  private async loginToNaukri(
    page: Page,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      this.logger.log('Logging into Naukri...');

      await page.goto('https://www.naukri.com/nlogin/login', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      await this.randomDelay();

      // Enter email
      await page.type('#usernameField', email, {
        delay: 100 + Math.random() * 200,
      });
      await this.randomDelay();

      // Enter password
      await page.type('#passwordField', password, {
        delay: 100 + Math.random() * 200,
      });
      await this.randomDelay();

      // Click login button
      await page.click('.loginButton');
      await this.randomDelay();

      // Wait for navigation
      await page
        .waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
        .catch(() => {});

      // Check if login was successful
      const currentUrl = page.url();
      if (!currentUrl.includes('nlogin')) {
        this.logger.log('Naukri login successful');
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error(
        'Naukri login failed',
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }

  async searchJobs(
    keywords: string[],
    location: string | undefined,
    credentials: NaukriCredentials,
  ): Promise<ScrapedJob[]> {
    this.logger.log(
      `Searching Naukri jobs: keywords=${keywords.join(',')}, location=${location}`,
    );

    const jobs: ScrapedJob[] = [];
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Try to use session data first
      if (credentials.sessionData) {
        try {
          const sessionData = JSON.parse(credentials.sessionData);
          if (Array.isArray(sessionData)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await page.setCookie(...sessionData);
            this.logger.log('Restored Naukri session from cookies');
          }
        } catch {
          this.logger.warn('Failed to parse session data');
        }
      }

      // Always attempt login so logs clearly show login behaviour
      const loginSuccess = await this.loginToNaukri(
        page,
        credentials.email,
        credentials.password,
      );
      if (!loginSuccess) {
        this.logger.error('Failed to login to Naukri, skipping search');
        return [];
      }

      // Build search URL - Naukri uses query parameters
      const searchQuery = encodeURIComponent(keywords.join(' '));
      const locationParam = location ? encodeURIComponent(location) : 'india';
      const searchUrl = `https://www.naukri.com/jobs-in-${locationParam}?k=${searchQuery}&l=${locationParam}&freshness=1`;

      this.logger.log(`Navigating to: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.randomDelay();

      // Scroll to load more jobs
      await this.scrollToLoadJobs(page);

      // Parse job listings - Naukri uses different selectors
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

          if (!titleEl || !linkEl) continue;

          const title = await this.getTextContent(titleEl);
          const company = companyEl
            ? await this.getTextContent(companyEl)
            : 'Unknown';
          const location = locationEl
            ? await this.getTextContent(locationEl)
            : '';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          const jobUrl = await page.evaluate((el: any) => el.href, linkEl);
          const postedTime = timeEl ? await this.getTextContent(timeEl) : '';
          const applicantsText = applicantsEl
            ? await this.getTextContent(applicantsEl)
            : '';

          // Parse applicant count
          const applicantCount = this.parseApplicantCount(applicantsText);

          // Parse posted time
          const postedAt = this.parsePostedTime(postedTime);

          // Skip if posted more than 1 hour ago or has too many applicants
          const age = Date.now() - postedAt.getTime();
          if (age > 60 * 60 * 1000) continue;
          if (applicantCount && applicantCount > 10) continue;

          // Extract external ID from URL
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
        } catch {
          this.logger.warn('Error parsing job card');
        }
      }

      // Save session cookies
      const cookies = await page.cookies();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sessionData = JSON.stringify(cookies);

      this.logger.log(`Found ${jobs.length} fresh jobs with < 10 applicants`);

      return jobs;
    } catch (error) {
      this.logger.error(
        'Error searching Naukri jobs',
        error instanceof Error ? error.stack : error,
      );
      return [];
    } finally {
      await page.close();
    }
  }

  private async scrollToLoadJobs(page: Page): Promise<void> {
    let previousHeight = 0;
    for (let i = 0; i < 5; i++) {
      const currentHeight = await page.evaluate(
        () => document.body.scrollHeight,
      );
      if (currentHeight === previousHeight) break;

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await this.randomDelay();

      previousHeight = currentHeight;
    }
  }

  private async getTextContent(element: any): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await element.evaluate((el: any) => el.textContent.trim());
  }

  private parseApplicantCount(text: string): number | undefined {
    if (!text) return undefined;
    const match = text.match(/(\d+)\s*applicant/);
    return match ? parseInt(match[1], 10) : undefined;
  }

  private parsePostedTime(text: string): Date {
    const now = new Date();
    if (!text) return now;

    const hourMatch = text.match(/(\d+)\s*hour/i);
    const minMatch = text.match(/(\d+)\s*min/i);
    const dayMatch = text.match(/(\d+)\s*day/i);

    if (hourMatch) {
      return new Date(now.getTime() - parseInt(hourMatch[1]) * 60 * 60 * 1000);
    } else if (minMatch) {
      return new Date(now.getTime() - parseInt(minMatch[1]) * 60 * 1000);
    } else if (dayMatch) {
      return new Date(
        now.getTime() - parseInt(dayMatch[1]) * 24 * 60 * 60 * 1000,
      );
    }

    return now;
  }

  private extractJobId(url: string): string {
    const match = url.match(/\/job-listings\/([^/]+)/);
    return match
      ? match[1]
      : `naukri-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async applyToJob(
    jobUrl: string,
    resumeFilePath: string,
    credentials: NaukriCredentials,
  ): Promise<{ success: boolean; sessionData?: string; error?: string }> {
    this.logger.log(`Applying to Naukri job: ${jobUrl}`);

    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Restore session
      if (credentials.sessionData) {
        try {
          const sessionData = JSON.parse(credentials.sessionData);
          if (Array.isArray(sessionData)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await page.setCookie(...sessionData);
          }
        } catch {}
      }

      await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.randomDelay();

      // Look for Apply button
      const applyButton = await page.$(
        '.apply-button, .apply-button-wrap .apply-button, button.apply-button',
      );

      if (!applyButton) {
        // Try other selectors
        const applyLink = await page.$('a[href*="apply"], .apply-button-link');
        if (!applyLink) {
          return { success: false, error: 'No apply button found' };
        }
        await applyLink.click();
      } else {
        await applyButton.click();
      }

      await this.randomDelay();

      // Look for resume upload explicitly
      const resumeUpload = await page.$(
        'input[type="file"], input[name="resume"]',
      );
      if (resumeUpload && resumeFilePath) {
        this.logger.log(
          `Uploading tailored resume PDF to Naukri from: ${resumeFilePath}`,
        );
        await resumeUpload.uploadFile(resumeFilePath);
        await this.randomDelay();
      }

      await this.randomDelay();

      // Switch to new tab if opened
      const pages = await browser.pages();
      if (pages.length > 2) {
        await pages[pages.length - 1].bringToFront();
      }

      // Fill application form if it appears
      // Note: Many Naukri jobs redirect to company site

      // Check for application success
      const pageContent = await page.content();
      if (
        pageContent.includes('applied successfully') ||
        pageContent.includes('Application Submitted')
      ) {
        const cookies = await page.cookies();
        return {
          success: true,
          sessionData: JSON.stringify(cookies),
        };
      }

      // If redirected to company site, we can't automate further
      if (!page.url().includes('naukri.com')) {
        return {
          success: true,
          sessionData: JSON.stringify(await page.cookies()),
          error: 'Redirected to company site - manual apply required',
        };
      }

      return { success: false, error: 'Could not complete application' };
    } catch (error) {
      this.logger.error(
        'Error applying to Naukri job',
        error instanceof Error ? error.stack : error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    } finally {
      await page.close();
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
