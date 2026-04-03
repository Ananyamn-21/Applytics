import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Skill } from '../models/skill.model.js';
import { CreateSkillDto, UpdateSkillDto } from './dto/create-skill.dto.js';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill) private readonly skillModel: typeof Skill) {}

  async findAllByUser(userId: string) {
    return this.skillModel.findAll({ where: { userId } });
  }

  async create(userId: string, dto: CreateSkillDto) {
    return this.skillModel.create({ ...dto, userId });
  }

  async update(userId: string, skillId: string, dto: UpdateSkillDto) {
    const skill = await this.skillModel.findOne({
      where: { id: skillId, userId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    return skill.update(dto);
  }

  async remove(userId: string, skillId: string) {
    const skill = await this.skillModel.findOne({
      where: { id: skillId, userId },
    });
    if (!skill) {
      throw new NotFoundException('Skill not found');
    }
    await skill.destroy();
    return { message: 'Skill deleted' };
  }
}
