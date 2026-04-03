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
exports.JobPreference = exports.JobType = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_js_1 = require("./user.model.js");
var JobType;
(function (JobType) {
    JobType["FULL_TIME"] = "full-time";
    JobType["PART_TIME"] = "part-time";
    JobType["CONTRACT"] = "contract";
    JobType["INTERNSHIP"] = "internship";
})(JobType || (exports.JobType = JobType = {}));
let JobPreference = class JobPreference extends sequelize_typescript_1.Model {
};
exports.JobPreference = JobPreference;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], JobPreference.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_js_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], JobPreference.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], JobPreference.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)([]),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ARRAY(sequelize_typescript_1.DataType.STRING)),
    __metadata("design:type", Array)
], JobPreference.prototype, "keywords", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", Object)
], JobPreference.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], JobPreference.prototype, "remote", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Object)
], JobPreference.prototype, "minSalary", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER),
    __metadata("design:type", Object)
], JobPreference.prototype, "maxSalary", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(JobType.FULL_TIME),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(JobType))),
    __metadata("design:type", String)
], JobPreference.prototype, "jobType", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], JobPreference.prototype, "isActive", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_js_1.User),
    __metadata("design:type", user_model_js_1.User)
], JobPreference.prototype, "user", void 0);
exports.JobPreference = JobPreference = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'job_preferences', timestamps: true })
], JobPreference);
//# sourceMappingURL=job-preference.model.js.map