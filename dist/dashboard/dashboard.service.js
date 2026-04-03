"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const job_application_model_js_1 = require("../models/job-application.model.js");
const job_model_js_1 = require("../models/job.model.js");
const platform_account_model_js_1 = require("../models/platform-account.model.js");
const job_preference_model_js_1 = require("../models/job-preference.model.js");
let DashboardService = class DashboardService {
    jobApplicationModel;
    platformAccountModel;
    jobPreferenceModel;
    constructor(jobApplicationModel, platformAccountModel, jobPreferenceModel) {
        this.jobApplicationModel = jobApplicationModel;
        this.platformAccountModel = platformAccountModel;
        this.jobPreferenceModel = jobPreferenceModel;
    }
    async getDashboard(userId) {
        const [stats, recentApplications, platformStatus, activePreferences] = await Promise.all([
            this.getApplicationStats(userId),
            this.getRecentApplications(userId),
            this.getPlatformStatus(userId),
            this.getActivePreferences(userId),
        ]);
        return {
            stats,
            recentApplications,
            platformStatus,
            activePreferences,
        };
    }
    async getApplicationStats(userId) {
        const total = await this.jobApplicationModel.count({ where: { userId } });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayCount = await this.jobApplicationModel.count({
            where: { userId, appliedAt: { [sequelize_2.Op.gte]: today } },
        });
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const weekCount = await this.jobApplicationModel.count({
            where: { userId, appliedAt: { [sequelize_2.Op.gte]: weekAgo } },
        });
        const statusBreakdown = await this.jobApplicationModel.findAll({
            where: { userId },
            attributes: ['status', [(0, sequelize_2.fn)('COUNT', (0, sequelize_2.col)('status')), 'count']],
            group: ['status'],
            raw: true,
        });
        return {
            totalApplications: total,
            appliedToday: todayCount,
            appliedThisWeek: weekCount,
            statusBreakdown,
        };
    }
    async getRecentApplications(userId) {
        return this.jobApplicationModel.findAll({
            where: { userId },
            include: [{ model: job_model_js_1.Job }],
            order: [['appliedAt', 'DESC']],
            limit: 10,
        });
    }
    async getPlatformStatus(userId) {
        return this.platformAccountModel.findAll({
            where: { userId },
            attributes: [
                'id',
                'platform',
                'email',
                'isConnected',
                'status',
                'lastActiveAt',
            ],
        });
    }
    async getActivePreferences(userId) {
        return this.jobPreferenceModel.findAll({
            where: { userId, isActive: true },
        });
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(job_application_model_js_1.JobApplication)),
    __param(1, (0, sequelize_1.InjectModel)(platform_account_model_js_1.PlatformAccount)),
    __param(2, (0, sequelize_1.InjectModel)(job_preference_model_js_1.JobPreference)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map