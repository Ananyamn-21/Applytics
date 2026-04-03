import { Model } from 'sequelize-typescript';
import { UserProfile } from './user-profile.model.js';
import { Skill } from './skill.model.js';
import { JobPreference } from './job-preference.model.js';
import { PlatformAccount } from './platform-account.model.js';
import { JobApplication } from './job-application.model.js';
export declare class User extends Model {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    profile: UserProfile;
    skills: Skill[];
    jobPreferences: JobPreference[];
    platformAccounts: PlatformAccount[];
    applications: JobApplication[];
}
