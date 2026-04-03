import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SkillsController } from './skills.controller.js';
import { SkillsService } from './skills.service.js';
import { Skill } from '../models/skill.model.js';

@Module({
  imports: [SequelizeModule.forFeature([Skill])],
  controllers: [SkillsController],
  providers: [SkillsService],
  exports: [SkillsService],
})
export class SkillsModule {}
