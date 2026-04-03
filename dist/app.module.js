"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_js_1 = require("./app.controller.js");
const app_service_js_1 = require("./app.service.js");
const config_module_js_1 = require("./config/config.module.js");
const database_module_js_1 = require("./database/database.module.js");
const auth_module_js_1 = require("./auth/auth.module.js");
const users_module_js_1 = require("./users/users.module.js");
const skills_module_js_1 = require("./skills/skills.module.js");
const job_preferences_module_js_1 = require("./job-preferences/job-preferences.module.js");
const platform_accounts_module_js_1 = require("./platform-accounts/platform-accounts.module.js");
const ai_module_js_1 = require("./ai/ai.module.js");
const jobs_module_js_1 = require("./jobs/jobs.module.js");
const job_applications_module_js_1 = require("./job-applications/job-applications.module.js");
const auto_apply_module_js_1 = require("./auto-apply/auto-apply.module.js");
const dashboard_module_js_1 = require("./dashboard/dashboard.module.js");
const scrapers_module_js_1 = require("./scrapers/scrapers.module.js");
const resume_generator_module_js_1 = require("./document-generator/resume-generator.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_module_js_1.AppConfigModule,
            database_module_js_1.DatabaseModule,
            auth_module_js_1.AuthModule,
            users_module_js_1.UsersModule,
            skills_module_js_1.SkillsModule,
            job_preferences_module_js_1.JobPreferencesModule,
            platform_accounts_module_js_1.PlatformAccountsModule,
            ai_module_js_1.AiModule,
            jobs_module_js_1.JobsModule,
            job_applications_module_js_1.JobApplicationsModule,
            auto_apply_module_js_1.AutoApplyModule,
            dashboard_module_js_1.DashboardModule,
            scrapers_module_js_1.ScrapersModule,
            resume_generator_module_js_1.ResumeGeneratorModule,
        ],
        controllers: [app_controller_js_1.AppController],
        providers: [app_service_js_1.AppService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map