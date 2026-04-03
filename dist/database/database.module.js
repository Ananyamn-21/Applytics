"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const config_1 = require("@nestjs/config");
const user_model_js_1 = require("../models/user.model.js");
const user_profile_model_js_1 = require("../models/user-profile.model.js");
const skill_model_js_1 = require("../models/skill.model.js");
const job_preference_model_js_1 = require("../models/job-preference.model.js");
const platform_account_model_js_1 = require("../models/platform-account.model.js");
const job_model_js_1 = require("../models/job.model.js");
const job_application_model_js_1 = require("../models/job-application.model.js");
let DatabaseModule = class DatabaseModule {
};
exports.DatabaseModule = DatabaseModule;
exports.DatabaseModule = DatabaseModule = __decorate([
    (0, common_1.Module)({
        imports: [
            sequelize_1.SequelizeModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    dialect: 'postgres',
                    host: configService.get('database.host'),
                    port: configService.get('database.port'),
                    username: configService.get('database.username'),
                    password: configService.get('database.password'),
                    database: configService.get('database.name'),
                    models: [
                        user_model_js_1.User,
                        user_profile_model_js_1.UserProfile,
                        skill_model_js_1.Skill,
                        job_preference_model_js_1.JobPreference,
                        platform_account_model_js_1.PlatformAccount,
                        job_model_js_1.Job,
                        job_application_model_js_1.JobApplication,
                    ],
                    autoLoadModels: true,
                    synchronize: true,
                    logging: false,
                }),
            }),
        ],
    })
], DatabaseModule);
//# sourceMappingURL=database.module.js.map