"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const sequelize_1 = require("@nestjs/sequelize");
const config_1 = require("@nestjs/config");
const auth_controller_js_1 = require("./auth.controller.js");
const auth_service_js_1 = require("./auth.service.js");
const jwt_strategy_js_1 = require("./strategies/jwt.strategy.js");
const user_model_js_1 = require("../models/user.model.js");
const user_profile_model_js_1 = require("../models/user-profile.model.js");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                inject: [config_1.ConfigService],
                useFactory: (configService) => {
                    const expiration = configService.get('jwt.expiration') || '7d';
                    return {
                        secret: configService.get('jwt.secret'),
                        signOptions: {
                            expiresIn: expiration,
                        },
                    };
                },
            }),
            sequelize_1.SequelizeModule.forFeature([user_model_js_1.User, user_profile_model_js_1.UserProfile]),
        ],
        controllers: [auth_controller_js_1.AuthController],
        providers: [auth_service_js_1.AuthService, jwt_strategy_js_1.JwtStrategy],
        exports: [auth_service_js_1.AuthService, jwt_strategy_js_1.JwtStrategy, passport_1.PassportModule],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map