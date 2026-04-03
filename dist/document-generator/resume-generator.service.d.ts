import { TailoredResume } from '../ai/ai.service.js';
import { Job } from '../models/job.model.js';
import { User } from '../models/user.model.js';
export declare class ResumeGeneratorService {
    private readonly logger;
    private readonly baseUploadsDir;
    private readonly templateDir;
    private readonly outputDir;
    constructor();
    private ensureDirectoriesExist;
    private registerHandlebarsHelpers;
    generatePdfResume(user: User, job: Job, tailoredData: TailoredResume | null, templateName?: string): Promise<string | null>;
    private createDefaultTemplate;
}
