"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlatformAccountsModule = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
const platform_accounts_controller_js_1 = require("./platform-accounts.controller.js");
const platform_accounts_service_js_1 = require("./platform-accounts.service.js");
const platform_account_model_js_1 = require("../models/platform-account.model.js");
let PlatformAccountsModule = class PlatformAccountsModule {
};
exports.PlatformAccountsModule = PlatformAccountsModule;
exports.PlatformAccountsModule = PlatformAccountsModule = __decorate([
    (0, common_1.Module)({
        imports: [sequelize_1.SequelizeModule.forFeature([platform_account_model_js_1.PlatformAccount])],
        controllers: [platform_accounts_controller_js_1.PlatformAccountsController],
        providers: [platform_accounts_service_js_1.PlatformAccountsService],
        exports: [platform_accounts_service_js_1.PlatformAccountsService],
    })
], PlatformAccountsModule);
//# sourceMappingURL=platform-accounts.module.js.map