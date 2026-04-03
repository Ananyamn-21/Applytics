import { Model } from 'sequelize-typescript';
import { User } from './user.model.js';
export declare enum Platform {
    LINKEDIN = "linkedin",
    NAUKRI = "naukri"
}
export declare enum AccountStatus {
    ACTIVE = "active",
    PAUSED = "paused",
    SUSPENDED = "suspended",
    ERROR = "error"
}
export declare class PlatformAccount extends Model {
    id: string;
    userId: string;
    platform: Platform;
    email: string;
    encryptedPassword: string;
    isConnected: boolean;
    lastActiveAt: Date | null;
    status: AccountStatus;
    sessionData: string | null;
    user: User;
}
