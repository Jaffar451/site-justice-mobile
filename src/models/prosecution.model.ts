// src/models/prosecution.model.ts

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
import Complaint from "./complaint.model";
import User from "./user.model";

@Table({ tableName: "Prosecutions", timestamps: true, underscored: true })
export default class Prosecution extends Model {
  // ─── Dossier lié ───────────────────────────────────────────────

  /**
   * Prosecution rattachée au Case — pas à la Complaint.
   * La Complaint est l'origine, le Case est la procédure active.
   */
  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  // ─── Plainte d'origine ─────────────────────────────────────────

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: true })
  complaintId?: number;

  @BelongsTo(() => Complaint, { as: "complaint" })
  complaint?: Complaint;

  // ─── Procureur ─────────────────────────────────────────────────

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  prosecutorId!: number;

  @BelongsTo(() => User, { as: "prosecutor" })
  prosecutor!: User;

  // ─── Acte de poursuite ─────────────────────────────────────────

  @Column({ type: DataType.DATE, allowNull: false })
  date!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @Column({
    type: DataType.ENUM(
      "classement",
      "renvoi_instruction",
      "renvoi_tribunal",
      "ordonnance_penale",
    ),
    allowNull: true,
  })
  prosecutionType?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  legalBasis?: string; // Article du code de procédure pénale

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
