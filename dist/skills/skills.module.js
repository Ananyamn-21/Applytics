"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const skills_controller_js_1 = require("./skills.controller.js");
const skills_service_js_1 = require("./skills.service.js");
const skill_model_js_1 = require("../models/skill.model.js");
let SkillsModule = class SkillsModule {
};
exports.SkillsModule = SkillsModule;
exports.SkillsModule = SkillsModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([skill_model_js_1.Skill])],
        controllers: [skills_controller_js_1.SkillsController],
        providers: [skills_service_js_1.SkillsService],
        exports: [skills_service_js_1.SkillsService],
    })
], SkillsModule);
//# sourceMappingURL=skills.module.js.map