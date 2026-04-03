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
exports.JobPreferencesService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const job_preference_model_js_1 = require("../models/job-preference.model.js");
let JobPreferencesService = class JobPreferencesService {
    jobPreferenceModel;
    constructor(jobPreferenceModel) {
        this.jobPreferenceModel = jobPreferenceModel;
    }
    async findAllByUser(userId) {
        return this.jobPreferenceModel.findAll({ where: { userId } });
    }
    async findActiveByUser(userId) {
        return this.jobPreferenceModel.findAll({
            where: { userId, isActive: true },
        });
    }
    async create(userId, dto) {
        return this.jobPreferenceModel.create({ ...dto, userId });
    }
    async update(userId, id, dto) {
        const preference = await this.jobPreferenceModel.findOne({
            where: { id, userId },
        });
        if (!preference) {
            throw new common_1.NotFoundException('Job preference not found');
        }
        return preference.update(dto);
    }
    async remove(userId, id) {
        const preference = await this.jobPreferenceModel.findOne({
            where: { id, userId },
        });
        if (!preference) {
            throw new common_1.NotFoundException('Job preference not found');
        }
        await preference.destroy();
        return { message: 'Job preference deleted' };
    }
};
exports.JobPreferencesService = JobPreferencesService;
exports.JobPreferencesService = JobPreferencesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(job_preference_model_js_1.JobPreference)),
    __metadata("design:paramtypes", [Object])
], JobPreferencesService);
//# sourceMappingURL=job-preferences.service.js.map