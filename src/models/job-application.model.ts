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
import { Job } from './job.model.js';

export enum ApplicationStatus {
  APPLIED = 'applied',
  VIEWED = 'viewed',
  SHORTLISTED = 'shortlisted',
  REJECTED = 'rejected',
  INTERVIEW = 'interview',
  OFFERED = 'offered',
}

@Table({ tableName: 'job_applications', timestamps: true })
export class JobApplication extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @ForeignKey(() => Job)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare jobId: string;

  @Default(ApplicationStatus.APPLIED)
  @Column(DataType.ENUM(...Object.values(ApplicationStatus)))
  declare status: ApplicationStatus;

  @Column(DataType.STRING)
  declare tailoredResumeUrl: string | null;

  @Column(DataType.TEXT)
  declare tailoredResumeText: string | null;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare appliedAt: Date;

  @Column(DataType.TEXT)
  declare notes: string | null;

  @BelongsTo(() => User)
  declare user: User;

  @BelongsTo(() => Job)
  declare job: Job;
}
