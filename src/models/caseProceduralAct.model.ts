// src/models/caseProceduralAct.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import CaseModel from "./case.model";
import ProceduralStep from "./proceduralStep.model";
import User from "./user.model";

export type ActStatus =
  | "pending" // en attente
  | "done" // accompli dans les délais
  | "overdue" // délai dépassé, non accompli
  | "waived"; // dispensé par décision motivée

@Table({ tableName: "CaseProceduralActs", timestamps: true, underscored: true })
export default class CaseProceduralAct extends Model {
  // ─── Dossier et étape ──────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  @ForeignKey(() => ProceduralStep)
  @Column({ type: DataType.INTEGER, allowNull: false })
  stepId!: number;

  @BelongsTo(() => ProceduralStep, { as: "step" })
  step!: ProceduralStep;

  // ─── Statut et délai ───────────────────────────────────────────

  @Column({
    type: DataType.ENUM("pending", "done", "overdue", "waived"),
    defaultValue: "pending",
  })
  status!: ActStatus;

  /**
   * Date limite calculée à la création du Case :
   * dueAt = case.openedAt + step.deadlineDays
   */
  @Column({ type: DataType.DATE, allowNull: false })
  dueAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  doneAt?: Date;

  /**
   * Calculé au moment où doneAt est renseigné.
   * true si doneAt > dueAt.
   */
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isLate!: boolean;

  // ─── Qui a accompli l'acte ─────────────────────────────────────

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  doneById?: number;

  @BelongsTo(() => User, { as: "doneBy" })
  doneBy?: User;

  // ─── Dispense ──────────────────────────────────────────────────

  /**
   * Obligatoire si status='waived'.
   * Motive la dispense — valeur juridique.
   */
  @Column({ type: DataType.TEXT, allowNull: true })
  waiverReason?: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  waivedById?: number;

  @BelongsTo(() => User, { as: "waivedBy" })
  waivedBy?: User;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
