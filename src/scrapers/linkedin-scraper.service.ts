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

// Enable stealth plugin
puppeteer.use(StealthPlugin());

export interface LinkedInCredentials {
  email: string;
  password: string;
  sessionData: string | null;
}

@Injectable()
export class LinkedinScraperService
  extends BaseScraperService
  implements OnModuleDestroy {
  private browser: Browser | null = null;

  async onModuleDestroy() {
    await this.closeBrowser();
  }

  constructor(configService: ConfigService) {
    super(configService, LinkedinScraperService.name);
  }

  private async getBrowser() {
    if (!this.browser || !this.browser.isConnected()) {
      this.browser = (await puppeteer.launch({
        headless: false, // Set to false so you can solve the captcha visibly!
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

  private async loginToLinkedIn(
    page: Page,
    email: string,
    password: string,
  ): Promise<boolean> {
    try {
      this.logger.log('Logging into LinkedIn...');

      await page.goto('https://www.linkedin.com/login', {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      await this.randomDelay();

      // Enter email
      await page.type('#username', email, { delay: 100 + Math.random() * 200 });
      await this.randomDelay();

      // Enter password
      await page.type('#password', password, {
        delay: 100 + Math.random() * 200,
      });
      await this.randomDelay();

      // Click login button
      await page.click('[type="submit"]');
      await this.randomDelay();

      // Wait for navigation
      await page
        .waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 })
        .catch(() => { });

      // Check if login was successful
      const currentUrl = page.url();
      if (currentUrl.includes('/feed') || currentUrl.includes('/jobs')) {
        this.logger.log('LinkedIn login successful');
        return true;
      }

      // Check for verification/captcha
      if (
        currentUrl.includes('verification') ||
        currentUrl.includes('checkpoint') ||
        (await page.$('#captcha'))
      ) {
        this.logger.warn(
          `LinkedIn requires 2FA or Captcha. A browser window should currently be open! Please manually solve the 2FA immediately. You have 3 minutes...`,
        );

        try {
          // Wait up to 3 minutes for the user to manually solve the Captcha/2FA
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 180000 });

          const afterSolveUrl = page.url();
          if (afterSolveUrl.includes('/feed') || afterSolveUrl.includes('/jobs') || afterSolveUrl.includes('/search')) {
            this.logger.log('LinkedIn login successful after manual Captcha/2FA solve!');
            return true;
          }
        } catch {
          this.logger.error('Timed out waiting for manual Captcha/2FA solve (3 minutes elapsed).');
          return false;
        }

        return false;
      }

      return false;
    } catch (error) {
      this.logger.error(
        'LinkedIn login failed',
        error instanceof Error ? error.stack : error,
      );
      return false;
    }
  }

  async searchJobs(
    keywords: string[],
    location: string | undefined,
    credentials: LinkedInCredentials,
  ): Promise<ScrapedJob[]> {
    this.logger.log(
      `Searching LinkedIn jobs: keywords=${keywords.join(',')}, location=${location}`,
    );

    const jobs: ScrapedJob[] = [];
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Try to use session data first (cookies)
      if (credentials.sessionData) {
        try {
          const sessionData = JSON.parse(credentials.sessionData);
          if (Array.isArray(sessionData)) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            await page.setCookie(...sessionData);
            this.logger.log('Restored LinkedIn session from cookies');
          }
        } catch {
          this.logger.warn('Failed to parse session data');
        }
      }

      // Always attempt login so logs clearly show login behaviour
      const loginSuccess = await this.loginToLinkedIn(
        page,
        credentials.email,
        credentials.password,
      );
      if (!loginSuccess) {
        this.logger.error('Failed to login to LinkedIn, skipping search');
        return [];
      }

      // Build search URL
      const searchQuery = encodeURIComponent(keywords.join(' '));
      const locationParam = location ? encodeURIComponent(location) : '';
      let searchUrl = `https://www.linkedin.com/jobs/search/?keywords=${searchQuery}&location=${locationParam}&f_TPR=r3600&sortBy=DD`;

      // Add filters for fresher jobs
      searchUrl += '&f_E=1%2C2'; // Entry level / Mid level

      this.logger.log(`Navigating to: ${searchUrl}`);
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 60000 });
      await this.randomDelay();

      // Scroll to load more jobs
      await this.scrollToLoadJobs(page);

      // Parse job listings using robust anchor-based approach to match current LinkedIn DOM
      const scrapedJobs = await page.evaluate(() => {
        const results: {
          externalId: string;
          title: string;
          company: string;
          location: string;
          jobUrl: string;
          postedText: string;
          applicantsText: string;
        }[] = [];

        // Collect all job view links; LinkedIn typically uses /jobs/view/{id}
        let links = Array.from(
          document.querySelectorAll<HTMLAnchorElement>(
            'a[href*="/jobs/view/"]',
          ),
        );

        // Fallback: some variants may not include /view/ directly, so broaden selector
        if (links.length === 0) {
          links = Array.from(
            document.querySelectorAll<HTMLAnchorElement>('a[href*="/jobs"]'),
          );
        }

        const seen = new Set<string>();

        for (const link of links) {
          try {
            const jobUrl = link.href;

            // Fix: First try to match /view/ID, then /jobs/view/ID, then fallback to extractJobId
            const idMatch = jobUrl.match(/\/view\/(\d+)/);
            let externalId = idMatch ? idMatch[1] : null;

            if (!externalId) {
              // Better fallback for generic links - grab a URL parameter if it exists or use random ID
              const currentJobIdMatch = jobUrl.match(/currentJobId=(\d+)/);
              externalId = currentJobIdMatch
                ? currentJobIdMatch[1]
                : `linkedin-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
            }

            if (seen.has(externalId)) continue;
            seen.add(externalId);

            const card =
              link.closest<HTMLElement>('[data-job-id]') ||
              link.closest<HTMLElement>('.jobs-search-results__list-item') ||
              link.closest<HTMLElement>('.job-card-container') ||
              link.parentElement;

            const titleEl =
              card?.querySelector<HTMLElement>('.job-card-list__title') ||
              link.querySelector<HTMLElement>('span[aria-hidden="true"]') ||
              link;

            const companyEl =
              card?.querySelector<HTMLElement>(
                '.job-card-container__company-name',
              ) ||
              card?.querySelector<HTMLElement>('.base-search-card__subtitle') ||
              card?.querySelector<HTMLElement>(
                '.artdeco-entity-lockup__subtitle',
              );

            const locationEl =
              card?.querySelector<HTMLElement>(
                '.job-card-container__metadata-item',
              ) ||
              card?.querySelector<HTMLElement>('.job-search-card__location');

            const timeEl =
              card?.querySelector<HTMLElement>(
                '.job-card-container__listed-time',
              ) || card?.querySelector<HTMLElement>('time');

            const applicantsEl =
              card?.querySelector<HTMLElement>(
                '.job-card-container__applicant-count',
              ) ||
              card?.querySelector<HTMLElement>('.job-search-card__insight');

            const title = titleEl?.textContent?.trim() ?? '';
            const company = companyEl?.textContent?.trim() ?? 'Unknown';
            const location = locationEl?.textContent?.trim() ?? '';
            const postedText = timeEl?.textContent?.trim() ?? '';
            const applicantsText = applicantsEl?.textContent?.trim() ?? '';

            if (!title) continue;

            results.push({
              externalId,
              title,
              company,
              location,
              jobUrl,
              postedText,
              applicantsText,
            });
          } catch {
            // Ignore single-card failures
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

      // Save session cookies
      const cookies = await page.cookies();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const sessionData = JSON.stringify(cookies);

      this.logger.log(`Found ${jobs.length} fresh jobs with < 10 applicants`);

      return jobs;
    } catch (error) {
      this.logger.error(
        'Error searching LinkedIn jobs',
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

    // Parse formats like "1 hour ago", "30m ago", "2d ago"
    const hourMatch = text.match(/(\d+)\s*h/);
    const minMatch = text.match(/(\d+)\s*m/);
    const dayMatch = text.match(/(\d+)\s*d/);

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
    const match = url.match(/view\/(\d+)/);
    return match
      ? match[1]
      : `linkedin-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  async applyToJob(
    jobUrl: string,
    resumeFilePath: string,
    credentials: LinkedInCredentials,
  ): Promise<{ success: boolean; sessionData?: string; error?: string }> {
    this.logger.log(`Applying to LinkedIn job: ${jobUrl}`);

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
        } catch { }
      }

      await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await this.randomDelay();

      // Verify we are not on a login or authwall page
      const currentUrl = page.url();
      if (
        currentUrl.includes('/login') ||
        currentUrl.includes('/authwall') ||
        currentUrl.includes('/checkpoint')
      ) {
        this.logger.warn(
          `Scraper was redirected from job page to authwall/login at ${currentUrl}. Attempting re-authentication.`,
        );
        const loginSuccess = await this.loginToLinkedIn(
          page,
          credentials.email,
          credentials.password,
        );
        if (!loginSuccess) {
          return {
            success: false,
            error: 'Failed to authenticate for application',
          };
        }
        // Go back to job URL after successful login
        await page.goto(jobUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        await this.randomDelay();
      }

      // Look for Easy Apply button
      // Some versions of the LinkedIn UI use `jobs-apply-button`, some use `artdeco-button--primary`
      let easyApplyButton: any = await page.$(
        'button.jobs-apply-button[aria-label*="Easy Apply"], button.sign-up-modal__outlet',
      );
      if (!easyApplyButton) {
        easyApplyButton = await page.$('button[aria-label*="Easy Apply"]');
      }

      if (!easyApplyButton) {
        // Try standard "Apply" button (external site redirect)
        let applyButton: any = await page.$(
          'button.jobs-apply-button[aria-label*="Apply"], .top-card-layout__cta, button[data-modal="job-details-topcard-apply-modal"]',
        );
        if (!applyButton) {
          applyButton = await page.$('.jobs-apply-button');
        }

        if (!applyButton) {
          return { success: false, error: 'No apply button found' };
        }

        await applyButton.click();
        await this.randomDelay();
      } else {
        await easyApplyButton.click();
        await this.randomDelay();
      }

      // Fill application form
      // Note: In a real implementation, you'd parse the form fields and fill them with resume data
      // This is a simplified version

      // Look for phone input
      const phoneInput = await page.$('input[name*="phone"]');
      if (phoneInput) {
        // Would need to get phone from user profile
        await this.randomDelay();
      }

      // Look for resume upload
      const resumeUpload = await page.$('input[type="file"]');
      if (resumeUpload && resumeFilePath) {
        this.logger.log(
          `Uploading tailored resume PDF from: ${resumeFilePath}`,
        );
        await resumeUpload.uploadFile(resumeFilePath);
        await this.randomDelay();
      }

      // Submit application
      const submitButton = await page.$(
        'button[aria-label*="Submit application"], button[type="submit"]',
      );
      if (submitButton) {
        await submitButton.click();
        await this.randomDelay();

        // Check for success
        const pageContent = await page.content();
        if (
          pageContent.includes('application submitted') ||
          pageContent.includes('successfully')
        ) {
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
    } catch (error) {
      this.logger.error(
        'Error applying to LinkedIn job',
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
