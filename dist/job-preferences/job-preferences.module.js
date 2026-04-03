"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPreferencesModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const job_preferences_controller_js_1 = require("./job-preferences.controller.js");
const job_preferences_service_js_1 = require("./job-preferences.service.js");
const job_preference_model_js_1 = require("../models/job-preference.model.js");
let JobPreferencesModule = class JobPreferencesModule {
};
exports.JobPreferencesModule = JobPreferencesModule;
exports.JobPreferencesModule = JobPreferencesModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([job_preference_model_js_1.JobPreference])],
        controllers: [job_preferences_controller_js_1.JobPreferencesController],
        providers: [job_preferences_service_js_1.JobPreferencesService],
        exports: [job_preferences_service_js_1.JobPreferencesService],
    })
], JobPreferencesModule);
//# sourceMappingURL=job-preferences.module.js.map