import { JobApplication } from '../models/job-application.model.js';
export declare class JobApplicationsService {
    private readonly jobApplicationModel;
    constructor(jobApplicationModel: typeof JobApplication);
    findAllByUser(userId: string, page?: number, limit?: number): Promise<{
        applications: JobApplication[];
        total: number;
        page: number;
        limit: number;
    }>;
    findById(userId: string, applicationId: string): Promise<JobApplication>;
    createApplication(data: {
        userId: string;
        jobId: string;
        tailoredResumeText?: string;
        tailoredResumeUrl?: string;
        notes?: string;
    }): Promise<JobApplication>;
    hasApplied(userId: string, jobId: string): Promise<boolean>;
    countTodayApplications(userId: string): Promise<number>;
    countHourApplications(userId: string): Promise<number>;
    getStats(userId: string): Promise<{
        total: number;
        byStatus: import("sequelize").GroupedCountResultItem[];
    }>;
}
