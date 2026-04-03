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
exports.SkillsService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const skill_model_js_1 = require("../models/skill.model.js");
let SkillsService = class SkillsService {
    skillModel;
    constructor(skillModel) {
        this.skillModel = skillModel;
    }
    async findAllByUser(userId) {
        return this.skillModel.findAll({ where: { userId } });
    }
    async create(userId, dto) {
        return this.skillModel.create({ ...dto, userId });
    }
    async update(userId, skillId, dto) {
        const skill = await this.skillModel.findOne({
            where: { id: skillId, userId },
        });
        if (!skill) {
            throw new common_1.NotFoundException('Skill not found');
        }
        return skill.update(dto);
    }
    async remove(userId, skillId) {
        const skill = await this.skillModel.findOne({
            where: { id: skillId, userId },
        });
        if (!skill) {
            throw new common_1.NotFoundException('Skill not found');
        }
        await skill.destroy();
        return { message: 'Skill deleted' };
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(skill_model_js_1.Skill)),
    __metadata("design:paramtypes", [Object])
], SkillsService);
//# sourceMappingURL=skills.service.js.map