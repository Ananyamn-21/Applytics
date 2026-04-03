import type { Response } from 'express';
import { JobApplicationsService } from './job-applications.service.js';
export declare class JobApplicationsController {
    private readonly jobApplicationsService;
    constructor(jobApplicationsService: JobApplicationsService);
    findAll(userId: string, page?: string, limit?: string): Promise<{
        applications: import("../models/job-application.model.js").JobApplication[];
        total: number;
        page: number;
        limit: number;
    }>;
    getStats(userId: string): Promise<{
        total: number;
        byStatus: import("sequelize").GroupedCountResultItem[];
    }>;
    findOne(userId: string, applicationId: string): Promise<import("../models/job-application.model.js").JobApplication>;
    downloadResume(userId: string, applicationId: string, res: Response): Promise<void>;
}
