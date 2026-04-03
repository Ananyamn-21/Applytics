import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { JobType } from '../../models/job-preference.model.js';

export class CreateJobPreferenceDto {
  @IsString()
  @IsNotEmpty()
  role!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;
}

export class UpdateJobPreferenceDto {
  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsBoolean()
  remote?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  minSalary?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxSalary?: number;

  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
