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

export enum Proficiency {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

@Table({ tableName: 'skills', timestamps: true })
export class Skill extends Model {
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
  declare name: string;

  @Default(Proficiency.INTERMEDIATE)
  @Column(DataType.ENUM(...Object.values(Proficiency)))
  declare proficiency: Proficiency;

  @BelongsTo(() => User)
  declare user: User;
}
