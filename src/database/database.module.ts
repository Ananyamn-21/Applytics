import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigService } from '@nestjs/config';
import { User } from '../models/user.model.js';
import { UserProfile } from '../models/user-profile.model.js';
import { Skill } from '../models/skill.model.js';
import { JobPreference } from '../models/job-preference.model.js';
import { PlatformAccount } from '../models/platform-account.model.js';
import { Job } from '../models/job.model.js';
import { JobApplication } from '../models/job-application.model.js';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        models: [
          User,
          UserProfile,
          Skill,
          JobPreference,
          PlatformAccount,
          Job,
          JobApplication,
        ],
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
