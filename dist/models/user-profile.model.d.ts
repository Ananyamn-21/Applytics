import { Model } from 'sequelize-typescript';
import { User } from './user.model.js';
export declare class UserProfile extends Model {
    id: string;
    userId: string;
    resumeUrl: string | null;
    resumeText: string | null;
    experience: number | null;
    location: string | null;
    phone: string | null;
    summary: string | null;
    user: User;
}
