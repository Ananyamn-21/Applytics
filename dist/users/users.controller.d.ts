import type { Multer } from 'multer';
import { UsersService } from './users.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(userId: string): Promise<import("../models/user.model.js").User>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<import("../models/user.model.js").User>;
    uploadResume(userId: string, file: Multer.File): Promise<{
        resumeUrl: string;
        parsed: boolean;
    }>;
}
