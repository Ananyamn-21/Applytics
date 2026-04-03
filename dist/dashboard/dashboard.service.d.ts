import { JobApplication } from '../models/job-application.model.js';
import { PlatformAccount } from '../models/platform-account.model.js';
import { JobPreference } from '../models/job-preference.model.js';
export declare class DashboardService {
    private readonly jobApplicationModel;
    private readonly platformAccountModel;
    private readonly jobPreferenceModel;
    constructor(jobApplicationModel: typeof JobApplication, platformAccountModel: typeof PlatformAccount, jobPreferenceModel: typeof JobPreference);
    getDashboard(userId: string): Promise<{
        stats: {
            totalApplications: number;
            appliedToday: number;
            appliedThisWeek: number;
            statusBreakdown: JobApplication[];
        };
        recentApplications: JobApplication[];
        platformStatus: PlatformAccount[];
        activePreferences: JobPreference[];
    }>;
    private getApplicationStats;
    private getRecentApplications;
    private getPlatformStatus;
    private getActivePreferences;
}
