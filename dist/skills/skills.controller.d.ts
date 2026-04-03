import { SkillsService } from './skills.service.js';
import { CreateSkillDto, UpdateSkillDto } from './dto/create-skill.dto.js';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    findAll(userId: string): Promise<import("../models/skill.model.js").Skill[]>;
    create(userId: string, dto: CreateSkillDto): Promise<import("../models/skill.model.js").Skill>;
    update(userId: string, skillId: string, dto: UpdateSkillDto): Promise<import("../models/skill.model.js").Skill>;
    remove(userId: string, skillId: string): Promise<{
        message: string;
    }>;
}
