import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  AllowNull,
  HasMany,
} from 'sequelize-typescript';
import { JobApplication } from './job-application.model.js';

export enum JobPlatform {
  LINKEDIN = 'linkedin',
  NAUKRI = 'naukri',
}

@Table({
  tableName: 'jobs',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['externalId', 'platform'],
      name: 'jobs_externalId_platform_key',
    },
  ],
})
export class Job extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare externalId: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(JobPlatform)))
  declare platform: JobPlatform;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare title: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare company: string;

  @Column(DataType.STRING)
  declare location: string | null;

  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare jobUrl: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare postedAt: Date;

  @Column(DataType.INTEGER)
  declare applicantCount: number | null;

  @Column(DataType.STRING)
  declare salary: string | null;

  @Column(DataType.STRING)
  declare jobType: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isRemote: boolean;

  @HasMany(() => JobApplication)
  declare applications: JobApplication[];
}
