import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import User from './user.model';

@Table({ tableName: 'ArrestWarrants', timestamps: true, underscored: true })
export default class ArrestWarrant extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @Column({ type: DataType.STRING, allowNull: false })
  personName!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  suspectAddress?: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  issuingJudgeId!: number;

  @BelongsTo(() => User, { as: 'judge' })
  judge!: User;

  @Column({ type: DataType.DATE, allowNull: false })
  issuedAt!: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  executed!: boolean;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}