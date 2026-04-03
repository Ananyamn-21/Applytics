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

export enum JobType {
  FULL_TIME = 'full-time',
  PART_TIME = 'part-time',
  CONTRACT = 'contract',
  INTERNSHIP = 'internship',
}

@Table({ tableName: 'job_preferences', timestamps: true })
export class JobPreference extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @AllowNull(false)
  @Column(DataType.STRING)
  declare role: string;

  @Default([])
  @Column(DataType.ARRAY(DataType.STRING))
  declare keywords: string[];

  @Column(DataType.STRING)
  declare location: string | null;

  @Default(false)
  @Column(DataType.BOOLEAN)
  declare remote: boolean;

  @Column(DataType.INTEGER)
  declare minSalary: number | null;

  @Column(DataType.INTEGER)
  declare maxSalary: number | null;

  @Default(JobType.FULL_TIME)
  @Column(DataType.ENUM(...Object.values(JobType)))
  declare jobType: JobType;

  @Default(true)
  @Column(DataType.BOOLEAN)
  declare isActive: boolean;

  @BelongsTo(() => User)
  declare user: User;
}
