import { Model } from 'sequelize-typescript';
import { JobApplication } from './job-application.model.js';
export declare enum JobPlatform {
    LINKEDIN = "linkedin",
    NAUKRI = "naukri"
}
export declare class Job extends Model {
    id: string;
    externalId: string;
    platform: JobPlatform;
    title: string;
    company: string;
    location: string | null;
    description: string | null;
    jobUrl: string;
    postedAt: Date;
    applicantCount: number | null;
    salary: string | null;
    jobType: string | null;
    isRemote: boolean;
    applications: JobApplication[];
}
