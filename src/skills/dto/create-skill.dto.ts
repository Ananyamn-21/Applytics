import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Proficiency } from '../../models/skill.model.js';

export class CreateSkillDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsEnum(Proficiency)
  proficiency?: Proficiency;
}

export class UpdateSkillDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Proficiency)
  proficiency?: Proficiency;
}
