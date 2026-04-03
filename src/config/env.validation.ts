import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  // Application
  @IsNumber()
  @IsOptional()
  PORT: number = 3000;

  // Database
  @IsString()
  @IsNotEmpty()
  DB_HOST!: string;

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME!: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD!: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME!: string;

  // JWT
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRATION: string = '7d';

  // OpenAI
  @IsString()
  @IsNotEmpty()
  OPENAI_API_KEY!: string;

  // Encryption
  @IsString()
  @MinLength(32)
  ENCRYPTION_KEY!: string;

  // Redis
  @IsString()
  @IsOptional()
  REDIS_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  REDIS_PORT: number = 6379;

  // Auto Apply Rate Limits
  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  MAX_APPLICATIONS_PER_HOUR: number = 15;

  @IsNumber()
  @Min(1)
  @Max(500)
  @IsOptional()
  MAX_APPLICATIONS_PER_DAY: number = 50;

  @IsNumber()
  @Min(1)
  @IsOptional()
  MIN_DELAY_SECONDS: number = 3;

  @IsNumber()
  @Min(1)
  @IsOptional()
  MAX_DELAY_SECONDS: number = 15;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors
        .map(
          (e) =>
            `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`,
        )
        .join('\n')}`,
    );
  }

  return validatedConfig;
}
