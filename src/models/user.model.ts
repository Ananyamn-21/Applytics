import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  Unique,
  AllowNull,
  HasOne,
  HasMany,
} from 'sequelize-typescript';
import { UserProfile } from './user-profile.model.js';
import { Skill } from './skill.model.js';
import { JobPreference } from './job-preference.model.js';
import { PlatformAccount } from './platform-account.model.js';
import { JobApplication } from './job-application.model.js';

@Table({ tableName: 'users', timestamps: true })
export class User extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare password: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare firstName: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare lastName: string;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @HasOne(() => UserProfile)
  declare profile: UserProfile;

  @HasMany(() => Skill)
  declare skills: Skill[];

  @HasMany(() => JobPreference)
  declare jobPreferences: JobPreference[];

  @HasMany(() => PlatformAccount)
  declare platformAccounts: PlatformAccount[];

  @HasMany(() => JobApplication)
  declare applications: JobApplication[];
}
