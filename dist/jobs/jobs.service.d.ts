import { Job, JobPlatform } from '../models/job.model.js';
export interface CreateJobData {
    externalId: string;
    platform: JobPlatform;
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
export declare class JobsService {
    private readonly jobModel;
    constructor(jobModel: typeof Job);
    upsertJob(data: CreateJobData): Promise<Job>;
    findRecentJobs(filters: {
        maxAgeMinutes?: number;
        maxApplicants?: number;
        keywords?: string[];
        location?: string;
        platform?: JobPlatform;
    }): Promise<Job[]>;
    findById(id: string): Promise<Job | null>;
    findAll(page?: number, limit?: number): Promise<{
        jobs: Job[];
        total: number;
        page: number;
        limit: number;
    }>;
}
