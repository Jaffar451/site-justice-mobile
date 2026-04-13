// src/models/qualificationHistory.model.ts

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
import Offense from "./offense.model";
import User from "./user.model";

@Table({
  tableName: "QualificationHistories",
  timestamps: true,
  underscored: true,
})
export default class QualificationHistory extends Model {
  // ─── Dossier concerné ──────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  // ─── Requalification ───────────────────────────────────────────

  @ForeignKey(() => Offense)
  @Column({ type: DataType.INTEGER, allowNull: false })
  fromOffenseId!: number;

  @BelongsTo(() => Offense, { as: "fromOffense" })
  fromOffense!: Offense;

  @ForeignKey(() => Offense)
  @Column({ type: DataType.INTEGER, allowNull: false })
  toOffenseId!: number;

  @BelongsTo(() => Offense, { as: "toOffense" })
  toOffense!: Offense;

  // ─── Contexte ──────────────────────────────────────────────────

  /**
   * Obligatoire — toute requalification doit être motivée.
   * Valeur juridique : peut être invoquée en appel.
   */
  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  changedById!: number;

  @BelongsTo(() => User, { as: "changedBy" })
  changedBy!: User;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  changedAt!: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
