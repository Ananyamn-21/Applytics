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
exports.User = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_profile_model_js_1 = require("./user-profile.model.js");
const skill_model_js_1 = require("./skill.model.js");
const job_preference_model_js_1 = require("./job-preference.model.js");
const platform_account_model_js_1 = require("./platform-account.model.js");
const job_application_model_js_1 = require("./job-application.model.js");
let User = class User extends sequelize_typescript_1.Model {
};
exports.User = User;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "firstName", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], User.prototype, "lastName", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(true),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], User.prototype, "isActive", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => user_profile_model_js_1.UserProfile),
    __metadata("design:type", user_profile_model_js_1.UserProfile)
], User.prototype, "profile", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => skill_model_js_1.Skill),
    __metadata("design:type", Array)
], User.prototype, "skills", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => job_preference_model_js_1.JobPreference),
    __metadata("design:type", Array)
], User.prototype, "jobPreferences", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => platform_account_model_js_1.PlatformAccount),
    __metadata("design:type", Array)
], User.prototype, "platformAccounts", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => job_application_model_js_1.JobApplication),
    __metadata("design:type", Array)
], User.prototype, "applications", void 0);
exports.User = User = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'users', timestamps: true })
], User);
//# sourceMappingURL=user.model.js.map