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
exports.PlatformAccountsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const sequelize_1 = require("@nestjs/sequelize");
const platform_account_model_js_1 = require("../models/platform-account.model.js");
const encryption_util_js_1 = require("../common/encryption.util.js");
let PlatformAccountsService = class PlatformAccountsService {
    platformAccountModel;
    configService;
    encryptionKey;
    constructor(platformAccountModel, configService) {
        this.platformAccountModel = platformAccountModel;
        this.configService = configService;
        this.encryptionKey = this.configService.get('encryption.key');
    }
    async findAllByUser(userId) {
        const accounts = await this.platformAccountModel.findAll({
            where: { userId },
            attributes: { exclude: ['encryptedPassword', 'sessionData'] },
        });
        return accounts;
    }
    async linkAccount(userId, dto) {
        const existing = await this.platformAccountModel.findOne({
            where: { userId, platform: dto.platform },
        });
        if (existing) {
            throw new common_1.ConflictException(`${dto.platform} account already linked. Unlink first.`);
        }
        const encryptedPassword = (0, encryption_util_js_1.encrypt)(dto.password, this.encryptionKey);
        const account = await this.platformAccountModel.create({
            userId,
            platform: dto.platform,
            email: dto.email,
            encryptedPassword,
            isConnected: true,
            status: platform_account_model_js_1.AccountStatus.ACTIVE,
        });
        return {
            id: account.id,
            platform: account.platform,
            email: account.email,
            isConnected: account.isConnected,
            status: account.status,
        };
    }
    async unlinkAccount(userId, accountId) {
        const account = await this.platformAccountModel.findOne({
            where: { id: accountId, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Platform account not found');
        }
        await account.destroy();
        return { message: `${account.platform} account unlinked` };
    }
    async pauseAccount(userId, accountId) {
        const account = await this.platformAccountModel.findOne({
            where: { id: accountId, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Platform account not found');
        }
        account.status = platform_account_model_js_1.AccountStatus.PAUSED;
        await account.save();
        return { message: `${account.platform} account paused` };
    }
    async resumeAccount(userId, accountId) {
        const account = await this.platformAccountModel.findOne({
            where: { id: accountId, userId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Platform account not found');
        }
        account.status = platform_account_model_js_1.AccountStatus.ACTIVE;
        await account.save();
        return { message: `${account.platform} account resumed` };
    }
    async getDecryptedCredentials(userId, platform) {
        const account = await this.platformAccountModel.findOne({
            where: { userId, platform, status: platform_account_model_js_1.AccountStatus.ACTIVE },
        });
        if (!account)
            return null;
        return {
            email: account.email,
            password: (0, encryption_util_js_1.decrypt)(account.encryptedPassword, this.encryptionKey),
            sessionData: account.sessionData,
        };
    }
    async updateSessionData(accountId, sessionData) {
        await this.platformAccountModel.update({ sessionData, lastActiveAt: new Date() }, { where: { id: accountId } });
    }
    async markError(accountId) {
        await this.platformAccountModel.update({ status: platform_account_model_js_1.AccountStatus.ERROR }, { where: { id: accountId } });
    }
};
exports.PlatformAccountsService = PlatformAccountsService;
exports.PlatformAccountsService = PlatformAccountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(platform_account_model_js_1.PlatformAccount)),
    __metadata("design:paramtypes", [Object, config_1.ConfigService])
], PlatformAccountsService);
//# sourceMappingURL=platform-accounts.service.js.map