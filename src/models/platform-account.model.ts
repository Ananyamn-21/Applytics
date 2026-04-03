import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  AllowNull,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from './user.model.js';

export enum Platform {
  LINKEDIN = 'linkedin',
  NAUKRI = 'naukri',
}

export enum AccountStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  SUSPENDED = 'suspended',
  ERROR = 'error',
}

@Table({ tableName: 'platform_accounts', timestamps: true })
export class PlatformAccount extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...Object.values(Platform)))
  declare platform: Platform;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare encryptedPassword: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare isConnected: boolean;

  @Column(DataType.DATE)
  declare lastActiveAt: Date | null;

  @Default(AccountStatus.ACTIVE)
  @Column(DataType.ENUM(...Object.values(AccountStatus)))
  declare status: AccountStatus;

  @Column(DataType.TEXT)
  declare sessionData: string | null;

  @BelongsTo(() => User)
  declare user: User;
}
