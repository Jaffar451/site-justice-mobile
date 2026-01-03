import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import User from './user.model';

export type PVType = "interrogation" | "hearing" | "seizure" | "witness_statement" | "crime_scene_report" | "other";

@Table({ tableName: 'ProcesVerbaux', timestamps: true, underscored: true })
export default class ProcesVerbal extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  authorId!: number;

  @BelongsTo(() => User, { as: 'author' })
  author!: User;

  @Column({ type: DataType.ENUM("interrogation", "hearing", "seizure", "witness_statement", "crime_scene_report", "other"), allowNull: false })
  pvType!: PVType;

  @Column({ type: DataType.TEXT, allowNull: false })
  content!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  redactedAt!: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}