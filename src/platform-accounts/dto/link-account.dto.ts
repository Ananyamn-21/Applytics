import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { Platform } from '../../models/platform-account.model.js';

export class LinkAccountDto {
  @IsEnum(Platform)
  platform!: Platform;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
