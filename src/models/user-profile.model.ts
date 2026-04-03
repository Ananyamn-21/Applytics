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

@Table({ tableName: 'user_profiles', timestamps: true })
export class UserProfile extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare userId: string;

  @Column(DataType.STRING)
  declare resumeUrl: string | null;

  @Column(DataType.TEXT)
  declare resumeText: string | null;

  @Column(DataType.INTEGER)
  declare experience: number | null;

  @Column(DataType.STRING)
  declare location: string | null;

  @Column(DataType.STRING)
  declare phone: string | null;

  @Column(DataType.TEXT)
  declare summary: string | null;

  @BelongsTo(() => User)
  declare user: User;
}
