import { Model } from 'sequelize-typescript';
import { User } from './user.model.js';
export declare enum Proficiency {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced",
    EXPERT = "expert"
}
export declare class Skill extends Model {
    id: string;
    userId: string;
    name: string;
    proficiency: Proficiency;
    user: User;
}
