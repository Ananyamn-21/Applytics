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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobApplication = exports.ApplicationStatus = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_js_1 = require("./user.model.js");
const job_model_js_1 = require("./job.model.js");
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["APPLIED"] = "applied";
    ApplicationStatus["VIEWED"] = "viewed";
    ApplicationStatus["SHORTLISTED"] = "shortlisted";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["INTERVIEW"] = "interview";
    ApplicationStatus["OFFERED"] = "offered";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
let JobApplication = class JobApplication extends sequelize_typescript_1.Model {
};
exports.JobApplication = JobApplication;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], JobApplication.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_js_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], JobApplication.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => job_model_js_1.Job),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], JobApplication.prototype, "jobId", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(ApplicationStatus.APPLIED),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(ApplicationStatus))),
    __metadata("design:type", String)
], JobApplication.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", Object)
], JobApplication.prototype, "tailoredResumeUrl", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], JobApplication.prototype, "tailoredResumeText", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.NOW),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], JobApplication.prototype, "appliedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], JobApplication.prototype, "notes", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_js_1.User),
    __metadata("design:type", user_model_js_1.User)
], JobApplication.prototype, "user", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => job_model_js_1.Job),
    __metadata("design:type", job_model_js_1.Job)
], JobApplication.prototype, "job", void 0);
exports.JobApplication = JobApplication = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'job_applications', timestamps: true })
], JobApplication);
//# sourceMappingURL=job-application.model.js.map