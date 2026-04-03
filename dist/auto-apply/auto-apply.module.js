"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoApplyModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const sequelize_1 = require("@nestjs/sequelize");
const auto_apply_service_js_1 = require("./auto-apply.service.js");
const user_model_js_1 = require("../models/user.model.js");
const job_application_model_js_1 = require("../models/job-application.model.js");
const jobs_module_js_1 = require("../jobs/jobs.module.js");
const job_applications_module_js_1 = require("../job-applications/job-applications.module.js");
const ai_module_js_1 = require("../ai/ai.module.js");
const platform_accounts_module_js_1 = require("../platform-accounts/platform-accounts.module.js");
const scrapers_module_js_1 = require("../scrapers/scrapers.module.js");
const resume_generator_module_js_1 = require("../document-generator/resume-generator.module.js");
let AutoApplyModule = class AutoApplyModule {
};
exports.AutoApplyModule = AutoApplyModule;
exports.AutoApplyModule = AutoApplyModule = __decorate([
    (0, common_1.Module)({
        imports: [
            schedule_1.ScheduleModule.forRoot(),
            sequelize_1.SequelizeModule.forFeature([user_model_js_1.User, job_application_model_js_1.JobApplication]),
            jobs_module_js_1.JobsModule,
            job_applications_module_js_1.JobApplicationsModule,
            ai_module_js_1.AiModule,
            platform_accounts_module_js_1.PlatformAccountsModule,
            scrapers_module_js_1.ScrapersModule,
            resume_generator_module_js_1.ResumeGeneratorModule,
        ],
        providers: [auto_apply_service_js_1.AutoApplyService],
        exports: [auto_apply_service_js_1.AutoApplyService],
    })
], AutoApplyModule);
//# sourceMappingURL=auto-apply.module.js.map