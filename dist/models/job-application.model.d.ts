import { Model } from 'sequelize-typescript';
import { User } from './user.model.js';
import { Job } from './job.model.js';
export declare enum ApplicationStatus {
    APPLIED = "applied",
    VIEWED = "viewed",
    SHORTLISTED = "shortlisted",
    REJECTED = "rejected",
    INTERVIEW = "interview",
    OFFERED = "offered"
}
export declare class JobApplication extends Model {
    id: string;
    userId: string;
    jobId: string;
    status: ApplicationStatus;
    tailoredResumeUrl: string | null;
    tailoredResumeText: string | null;
    appliedAt: Date;
    notes: string | null;
    user: User;
    job: Job;
}
