"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const sequelize_1 = require("@nestjs/sequelize");
require("multer");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const user_model_js_1 = require("../models/user.model.js");
const user_profile_model_js_1 = require("../models/user-profile.model.js");
const skill_model_js_1 = require("../models/skill.model.js");
const job_preference_model_js_1 = require("../models/job-preference.model.js");
const platform_account_model_js_1 = require("../models/platform-account.model.js");
let UsersService = class UsersService {
    userModel;
    userProfileModel;
    constructor(userModel, userProfileModel) {
        this.userModel = userModel;
        this.userProfileModel = userProfileModel;
    }
    async getProfile(userId) {
        const user = await this.userModel.findByPk(userId, {
            attributes: { exclude: ['password'] },
            include: [
                { model: user_profile_model_js_1.UserProfile },
                { model: skill_model_js_1.Skill },
                { model: job_preference_model_js_1.JobPreference },
                {
                    model: platform_account_model_js_1.PlatformAccount,
                    attributes: { exclude: ['encryptedPassword', 'sessionData'] },
                },
            ],
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user;
    }
    async updateProfile(userId, dto) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        if (dto.firstName)
            user.firstName = dto.firstName;
        if (dto.lastName)
            user.lastName = dto.lastName;
        await user.save();
        const profile = await this.userProfileModel.findOne({ where: { userId } });
        if (profile) {
            if (dto.experience !== undefined)
                profile.experience = dto.experience;
            if (dto.location)
                profile.location = dto.location;
            if (dto.phone)
                profile.phone = dto.phone;
            if (dto.summary)
                profile.summary = dto.summary;
            await profile.save();
        }
        return this.getProfile(userId);
    }
    async uploadResume(userId, file) {
        const profile = await this.userProfileModel.findOne({ where: { userId } });
        if (!profile) {
            throw new common_1.NotFoundException('User profile not found');
        }
        const uploadsDir = path.join(process.cwd(), 'uploads', 'resumes');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const fileObj = file;
        const fileName = `${userId}-${Date.now()}${path.extname(fileObj.originalname)}`;
        const filePath = path.join(uploadsDir, fileName);
        fs.writeFileSync(filePath, fileObj.buffer);
        let resumeText = '';
        if (fileObj.mimetype === 'application/pdf') {
            try {
                const pdfParse = require('pdf-parse');
                const result = await pdfParse(fileObj.buffer);
                resumeText = result.text;
            }
            catch {
                resumeText = '';
            }
        }
        profile.resumeUrl = `/uploads/resumes/${fileName}`;
        if (resumeText) {
            profile.resumeText = resumeText;
        }
        await profile.save();
        return {
            resumeUrl: profile.resumeUrl,
            parsed: !!resumeText,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, sequelize_1.InjectModel)(user_model_js_1.User)),
    __param(1, (0, sequelize_1.InjectModel)(user_profile_model_js_1.UserProfile)),
    __metadata("design:paramtypes", [Object, Object])
], UsersService);
//# sourceMappingURL=users.service.js.map