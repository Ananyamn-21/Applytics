import { OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseScraperService, ScrapedJob } from './base-scraper.service.js';
export interface NaukriCredentials {
    email: string;
    password: string;
    sessionData: string | null;
}
export declare class NaukriScraperService extends BaseScraperService implements OnModuleDestroy {
    private browser;
    onModuleDestroy(): Promise<void>;
    constructor(configService: ConfigService);
    private getBrowser;
    private loginToNaukri;
    searchJobs(keywords: string[], location: string | undefined, credentials: NaukriCredentials): Promise<ScrapedJob[]>;
    private scrollToLoadJobs;
    private getTextContent;
    private parseApplicantCount;
    private parsePostedTime;
    private extractJobId;
    applyToJob(jobUrl: string, resumeFilePath: string, credentials: NaukriCredentials): Promise<{
        success: boolean;
        sessionData?: string;
        error?: string;
    }>;
    closeBrowser(): Promise<void>;
}
