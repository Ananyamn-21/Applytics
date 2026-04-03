"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobApplicationsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const job_applications_controller_js_1 = require("./job-applications.controller.js");
const job_applications_service_js_1 = require("./job-applications.service.js");
const job_application_model_js_1 = require("../models/job-application.model.js");
let JobApplicationsModule = class JobApplicationsModule {
};
exports.JobApplicationsModule = JobApplicationsModule;
exports.JobApplicationsModule = JobApplicationsModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([job_application_model_js_1.JobApplication])],
        controllers: [job_applications_controller_js_1.JobApplicationsController],
        providers: [job_applications_service_js_1.JobApplicationsService],
        exports: [job_applications_service_js_1.JobApplicationsService],
    })
], JobApplicationsModule);
//# sourceMappingURL=job-applications.module.js.map