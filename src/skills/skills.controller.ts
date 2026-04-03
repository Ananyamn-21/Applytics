import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { SkillsService } from './skills.service.js';
import { CreateSkillDto, UpdateSkillDto } from './dto/create-skill.dto.js';

@Controller('skills')
@UseGuards(JwtAuthGuard)
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  findAll(@CurrentUser('id') userId: string) {
    return this.skillsService.findAllByUser(userId);
  }

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateSkillDto) {
    return this.skillsService.create(userId, dto);
  }

  @Put(':id')
  update(
    @CurrentUser('id') userId: string,
    @Param('id') skillId: string,
    @Body() dto: UpdateSkillDto,
  ) {
    return this.skillsService.update(userId, skillId, dto);
  }

  @Delete(':id')
  remove(@CurrentUser('id') userId: string, @Param('id') skillId: string) {
    return this.skillsService.remove(userId, skillId);
  }
}
