import { Proficiency } from '../../models/skill.model.js';
export declare class CreateSkillDto {
    name: string;
    proficiency?: Proficiency;
}
export declare class UpdateSkillDto {
    name?: string;
    proficiency?: Proficiency;
}
