import { JwtService } from '@nestjs/jwt';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/user-profile.model.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
export declare class AuthService {
    private readonly userModel;
    private readonly userProfileModel;
    private readonly jwtService;
    constructor(userModel: typeof User, userProfileModel: typeof UserProfile, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        accessToken: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
        };
        accessToken: string;
    }>;
    private generateToken;
}
