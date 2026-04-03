import { JobsService } from './jobs.service.js';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    findAll(page?: string, limit?: string): Promise<{
        jobs: import("../models/job.model.js").Job[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("../models/job.model.js").Job | null>;
}
