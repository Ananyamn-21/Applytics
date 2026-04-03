import { Skill } from '../models/skill.model.js';
import { CreateSkillDto, UpdateSkillDto } from './dto/create-skill.dto.js';
export declare class SkillsService {
    private readonly skillModel;
    constructor(skillModel: typeof Skill);
    findAllByUser(userId: string): Promise<Skill[]>;
    create(userId: string, dto: CreateSkillDto): Promise<Skill>;
    update(userId: string, skillId: string, dto: UpdateSkillDto): Promise<Skill>;
    remove(userId: string, skillId: string): Promise<{
        message: string;
    }>;
}
