// src/models/caseQualification.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import CaseModel from "./case.model";
import Offense from "./offense.model";
import User from "./user.model";

export type QualificationStage =
  | "provisional" // qualification initiale au dépôt
  | "prosecutor_review" // requalification par le procureur
  | "instruction" // requalification par le juge d'instruction
  | "final"; // qualification définitive au jugement

@Table({ tableName: "CaseQualifications", timestamps: true, underscored: true })
export default class CaseQualification extends Model {
  // ─── Dossier ───────────────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  // ─── Infraction qualifiée ──────────────────────────────────────

  @ForeignKey(() => Offense)
  @Column({ type: DataType.INTEGER, allowNull: false })
  offenseId!: number;

  @BelongsTo(() => Offense, { as: "offense" })
  offense!: Offense;

  // ─── Stade de qualification ────────────────────────────────────

  @Column({
    type: DataType.ENUM(
      "provisional",
      "prosecutor_review",
      "instruction",
      "final",
    ),
    allowNull: false,
  })
  stage!: QualificationStage;

  // ─── Qui a qualifié ────────────────────────────────────────────

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  qualifiedById!: number;

  @BelongsTo(() => User, { as: "qualifiedBy" })
  qualifiedBy!: User;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  qualifiedAt!: Date;

  // ─── Justification obligatoire en cas de requalification ───────

  @Column({ type: DataType.TEXT, allowNull: true })
  justification?: string;

  // ─── Versioning ────────────────────────────────────────────────

  /**
   * false = remplacée par une requalification ultérieure.
   * Une seule qualification isActive=true par caseId à la fois.
   */
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
