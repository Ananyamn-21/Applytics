import { Model } from 'sequelize-typescript';
import { User } from './user.model.js';
export declare enum JobType {
    FULL_TIME = "full-time",
    PART_TIME = "part-time",
    CONTRACT = "contract",
    INTERNSHIP = "internship"
}
export declare class JobPreference extends Model {
    id: string;
    userId: string;
    role: string;
    keywords: string[];
    location: string | null;
    remote: boolean;
    minSalary: number | null;
    maxSalary: number | null;
    jobType: JobType;
    isActive: boolean;
    user: User;
}
