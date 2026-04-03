import { JobType } from '../../models/job-preference.model.js';
export declare class CreateJobPreferenceDto {
    role: string;
    keywords?: string[];
    location?: string;
    remote?: boolean;
    minSalary?: number;
    maxSalary?: number;
    jobType?: JobType;
}
export declare class UpdateJobPreferenceDto {
    role?: string;
    keywords?: string[];
    location?: string;
    remote?: boolean;
    minSalary?: number;
    maxSalary?: number;
    jobType?: JobType;
    isActive?: boolean;
}
