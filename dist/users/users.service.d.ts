import 'multer';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/user-profile.model.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';
export declare class UsersService {
    private readonly userModel;
    private readonly userProfileModel;
    constructor(userModel: typeof User, userProfileModel: typeof UserProfile);
    getProfile(userId: string): Promise<User>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>;
    uploadResume(userId: string, file: any): Promise<{
        resumeUrl: string;
        parsed: boolean;
    }>;
}
