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
exports.JobApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const job_application_model_js_1 = require("../models/job-application.model.js");
const job_model_js_1 = require("../models/job.model.js");
let JobApplicationsService = class JobApplicationsService {
    jobApplicationModel;
    constructor(jobApplicationModel) {
        this.jobApplicationModel = jobApplicationModel;
    }
    async findAllByUser(userId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await this.jobApplicationModel.findAndCountAll({
            where: { userId },
            include: [{ model: job_model_js_1.Job }],
            order: [['appliedAt', 'DESC']],
            limit,
            offset,
        });
        return { applications: rows, total: count, page, limit };
    }
    async findById(userId, applicationId) {
        const application = await this.jobApplicationModel.findOne({
            where: { id: applicationId, userId },
            include: [{ model: job_model_js_1.Job }],
        });
        if (!application) {
            throw new common_1.NotFoundException('Application not found');
        }
        return application;
    }
    async createApplication(data) {
        return this.jobApplicationModel.create({
            ...data,
            status: job_application_model_js_1.ApplicationStatus.APPLIED,
            appliedAt: new Date(),
        });
    }
    async hasApplied(userId, jobId) {
        const count = await this.jobApplicationModel.count({
            where: { userId, jobId },
        });
        return count > 0;
    }
    async countTodayApplications(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return this.jobApplicationModel.count({
            where: {
                userId,
                appliedAt: { [sequelize_2.Op.gte]: today },
            },
        });
    }
    async countHourApplications(userId) {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return this.jobApplicationModel.count({
            where: {
                userId,
                appliedAt: { [sequelize_2.Op.gte]: hourAgo },
            },
        });
    }
    async getStats(userId) {
        const total = await this.jobApplicationModel.count({ where: { userId } });
        const byStatus = await this.jobApplicationModel.count({
            where: { userId },
            group: ['status'],
        });
        return { total, byStatus };
    }
};
exports.JobApplicationsService = JobApplicationsService;
exports.JobApplicationsService = JobApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(job_application_model_js_1.JobApplication)),
    __metadata("design:paramtypes", [Object])
], JobApplicationsService);
//# sourceMappingURL=job-applications.service.js.map