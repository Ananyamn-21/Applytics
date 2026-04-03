import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export interface ScrapedJob {
    externalId: string;
    title: string;
    company: string;
    location?: string;
    description?: string;
    jobUrl: string;
    postedAt: Date;
    applicantCount?: number;
    salary?: string;
    jobType?: string;
    isRemote?: boolean;
}
export declare abstract class BaseScraperService {
    protected readonly configService: ConfigService;
    protected readonly logger: Logger;
    private readonly minDelay;
    private readonly maxDelay;
    constructor(configService: ConfigService, loggerContext: string);
    protected randomDelay(): Promise<void>;
    protected exponentialBackoff(attempt: number): Promise<void>;
    abstract searchJobs(keywords: string[], location: string | undefined, credentials: {
        email: string;
        password: string;
        sessionData: string | null;
    }): Promise<ScrapedJob[]>;
    abstract applyToJob(jobUrl: string, resumeFilePath: string, credentials: {
        email: string;
        password: string;
        sessionData: string | null;
    }): Promise<{
        success: boolean;
        sessionData?: string;
        error?: string;
    }>;
}
