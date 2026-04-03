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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAccountsController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_js_1 = require("../common/guards/jwt-auth.guard.js");
const current_user_decorator_js_1 = require("../common/decorators/current-user.decorator.js");
const platform_accounts_service_js_1 = require("./platform-accounts.service.js");
const link_account_dto_js_1 = require("./dto/link-account.dto.js");
let PlatformAccountsController = class PlatformAccountsController {
    platformAccountsService;
    constructor(platformAccountsService) {
        this.platformAccountsService = platformAccountsService;
    }
    findAll(userId) {
        return this.platformAccountsService.findAllByUser(userId);
    }
    link(userId, dto) {
        return this.platformAccountsService.linkAccount(userId, dto);
    }
    unlink(userId, accountId) {
        return this.platformAccountsService.unlinkAccount(userId, accountId);
    }
    pause(userId, accountId) {
        return this.platformAccountsService.pauseAccount(userId, accountId);
    }
    resume(userId, accountId) {
        return this.platformAccountsService.resumeAccount(userId, accountId);
    }
};
exports.PlatformAccountsController = PlatformAccountsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PlatformAccountsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('link'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, link_account_dto_js_1.LinkAccountDto]),
    __metadata("design:returntype", void 0)
], PlatformAccountsController.prototype, "link", null);
__decorate([
    (0, common_1.Delete)(':id/unlink'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformAccountsController.prototype, "unlink", null);
__decorate([
    (0, common_1.Put)(':id/pause'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformAccountsController.prototype, "pause", null);
__decorate([
    (0, common_1.Put)(':id/resume'),
    __param(0, (0, current_user_decorator_js_1.CurrentUser)('id')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PlatformAccountsController.prototype, "resume", null);
exports.PlatformAccountsController = PlatformAccountsController = __decorate([
    (0, common_1.Controller)('platform-accounts'),
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    __metadata("design:paramtypes", [platform_accounts_service_js_1.PlatformAccountsService])
], PlatformAccountsController);
//# sourceMappingURL=platform-accounts.controller.js.map