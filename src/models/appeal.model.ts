// src/models/appeal.model.ts

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
import Decision from "./decision.model";
import User from "./user.model";
import Person from "./person.model";

export type AppealStatus = "pending" | "accepted" | "rejected" | "withdrawn";

@Table({ tableName: "Appeals", timestamps: true, underscored: true })
export default class Appeal extends Model {
  // ─── Dossier concerné ──────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  // ─── Décision contestée ────────────────────────────────────────

  @ForeignKey(() => Decision)
  @Column({ type: DataType.INTEGER, allowNull: true })
  contestedDecisionId?: number;

  @BelongsTo(() => Decision, { as: "contestedDecision" })
  contestedDecision?: Decision;

  // ─── Partie qui fait appel ─────────────────────────────────────

  @ForeignKey(() => Person)
  @Column({ type: DataType.INTEGER, allowNull: false })
  appellantId!: number;

  @BelongsTo(() => Person, { as: "appellant" })
  appellant!: Person;

  // ─── Avocat représentant ───────────────────────────────────────

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  lawyerId?: number;

  @BelongsTo(() => User, { as: "lawyer" })
  lawyer?: User;

  // ─── Détails de l'appel ────────────────────────────────────────

  @Column({ type: DataType.DATE, allowNull: false })
  appealDate!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({
    type: DataType.ENUM("pending", "accepted", "rejected", "withdrawn"),
    defaultValue: "pending",
  })
  status!: AppealStatus;

  @Column({ type: DataType.DATE, allowNull: true })
  decidedAt?: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  decisionNotes?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
