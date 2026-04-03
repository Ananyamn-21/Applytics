import { DashboardService } from './dashboard.service.js';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(userId: string): Promise<{
        stats: {
            totalApplications: number;
            appliedToday: number;
            appliedThisWeek: number;
            statusBreakdown: import("../models/job-application.model.js").JobApplication[];
        };
        recentApplications: import("../models/job-application.model.js").JobApplication[];
        platformStatus: import("../models/platform-account.model.js").PlatformAccount[];
        activePreferences: import("../models/job-preference.model.js").JobPreference[];
    }>;
}
