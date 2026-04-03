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
exports.PlatformAccount = exports.AccountStatus = exports.Platform = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const user_model_js_1 = require("./user.model.js");
var Platform;
(function (Platform) {
    Platform["LINKEDIN"] = "linkedin";
    Platform["NAUKRI"] = "naukri";
})(Platform || (exports.Platform = Platform = {}));
var AccountStatus;
(function (AccountStatus) {
    AccountStatus["ACTIVE"] = "active";
    AccountStatus["PAUSED"] = "paused";
    AccountStatus["SUSPENDED"] = "suspended";
    AccountStatus["ERROR"] = "error";
})(AccountStatus || (exports.AccountStatus = AccountStatus = {}));
let PlatformAccount = class PlatformAccount extends sequelize_typescript_1.Model {
};
exports.PlatformAccount = PlatformAccount;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    (0, sequelize_typescript_1.Default)(sequelize_typescript_1.DataType.UUIDV4),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], PlatformAccount.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_js_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.UUID),
    __metadata("design:type", String)
], PlatformAccount.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(Platform))),
    __metadata("design:type", String)
], PlatformAccount.prototype, "platform", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], PlatformAccount.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING),
    __metadata("design:type", String)
], PlatformAccount.prototype, "encryptedPassword", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.BOOLEAN),
    __metadata("design:type", Boolean)
], PlatformAccount.prototype, "isConnected", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Object)
], PlatformAccount.prototype, "lastActiveAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Default)(AccountStatus.ACTIVE),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...Object.values(AccountStatus))),
    __metadata("design:type", String)
], PlatformAccount.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], PlatformAccount.prototype, "sessionData", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_js_1.User),
    __metadata("design:type", user_model_js_1.User)
], PlatformAccount.prototype, "user", void 0);
exports.PlatformAccount = PlatformAccount = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'platform_accounts', timestamps: true })
], PlatformAccount);
//# sourceMappingURL=platform-account.model.js.map