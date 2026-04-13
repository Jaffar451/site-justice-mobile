// src/models/assignment.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import CaseModel from "./case.model";
import User from "./user.model";

export type AssignmentRole =
  | "prosecutor"
  | "judge_instruction"
  | "judge_trial"
  | "greffier"
  | "lawyer";

@Table({ tableName: "Assignments", timestamps: true, underscored: true })
export default class Assignment extends Model {
  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "assignedCase" })
  assignedCase!: CaseModel;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User, { as: "assignee" })
  assignee!: User;

  @Column({
    type: DataType.ENUM(
      "prosecutor",
      "judge_instruction",
      "judge_trial",
      "greffier",
      "lawyer",
    ),
    allowNull: false,
  })
  role!: AssignmentRole;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  assignedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  endedAt?: Date;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
