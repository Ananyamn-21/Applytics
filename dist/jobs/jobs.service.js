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
exports.JobsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const sequelize_2 = require("sequelize");
const job_model_js_1 = require("../models/job.model.js");
let JobsService = class JobsService {
    jobModel;
    constructor(jobModel) {
        this.jobModel = jobModel;
    }
    async upsertJob(data) {
        const [job] = await this.jobModel.upsert(data, {
            conflictFields: ['externalId', 'platform'],
        });
        return job;
    }
    async findRecentJobs(filters) {
        const where = {};
        if (filters.maxAgeMinutes) {
            const cutoff = new Date(Date.now() - filters.maxAgeMinutes * 60 * 1000);
            where.postedAt = { [sequelize_2.Op.gte]: cutoff };
        }
        if (filters.maxApplicants) {
            where.applicantCount = {
                [sequelize_2.Op.or]: [{ [sequelize_2.Op.lte]: filters.maxApplicants }, { [sequelize_2.Op.is]: null }],
            };
        }
        if (filters.platform) {
            where.platform = filters.platform;
        }
        if (filters.keywords && filters.keywords.length > 0) {
            where.title = {
                [sequelize_2.Op.or]: filters.keywords.map((kw) => ({
                    [sequelize_2.Op.iLike]: `%${kw}%`,
                })),
            };
        }
        if (filters.location) {
            where.location = { [sequelize_2.Op.iLike]: `%${filters.location}%` };
        }
        return this.jobModel.findAll({
            where,
            order: [['postedAt', 'DESC']],
            limit: 50,
        });
    }
    async findById(id) {
        return this.jobModel.findByPk(id);
    }
    async findAll(page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        const { rows, count } = await this.jobModel.findAndCountAll({
            order: [['postedAt', 'DESC']],
            limit,
            offset,
        });
        return { jobs: rows, total: count, page, limit };
    }
};
exports.JobsService = JobsService;
exports.JobsService = JobsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(job_model_js_1.Job)),
    __metadata("design:paramtypes", [Object])
], JobsService);
//# sourceMappingURL=jobs.service.js.map