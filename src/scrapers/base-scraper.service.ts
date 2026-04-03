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

export abstract class BaseScraperService {
  protected readonly logger: Logger;
  private readonly minDelay: number;
  private readonly maxDelay: number;

  constructor(
    protected readonly configService: ConfigService,
    loggerContext: string,
  ) {
    this.logger = new Logger(loggerContext);
    this.minDelay =
      this.configService.get<number>('autoApply.minDelaySeconds')! * 1000;
    this.maxDelay =
      this.configService.get<number>('autoApply.maxDelaySeconds')! * 1000;
  }

  protected async randomDelay(): Promise<void> {
    const delay = Math.floor(
      Math.random() * (this.maxDelay - this.minDelay) + this.minDelay,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  protected async exponentialBackoff(attempt: number): Promise<void> {
    const baseDelay = 5000;
    const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 3000;
    this.logger.warn(
      `Backoff attempt ${attempt}, waiting ${Math.round(delay / 1000)}s`,
    );
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  abstract searchJobs(
    keywords: string[],
    location: string | undefined,
    credentials: {
      email: string;
      password: string;
      sessionData: string | null;
    },
  ): Promise<ScrapedJob[]>;

  abstract applyToJob(
    jobUrl: string,
    resumeFilePath: string,
    credentials: {
      email: string;
      password: string;
      sessionData: string | null;
    },
  ): Promise<{ success: boolean; sessionData?: string; error?: string }>;
}
