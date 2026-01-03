import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import User from './user.model';

export type AssignmentRole = "police_investigator" | "prosecutor" | "judge_instruction" | "judge_trial" | "greffier" | "lawyer";

@Table({ tableName: 'Assignments', timestamps: true, underscored: true })
export default class Assignment extends Model {
  
  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'assignedCase' })
  assignedCase!: CaseModel;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User, { as: 'assignee' })
  assignee!: User;

  @Column({ type: DataType.ENUM("police_investigator", "prosecutor", "judge_instruction", "judge_trial", "greffier", "lawyer"), allowNull: false })
  role!: AssignmentRole;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  assignedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  endedAt?: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}