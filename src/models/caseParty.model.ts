// src/models/caseParty.model.ts

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
import Person from "./person.model";
import User from "./user.model";

export type CasePartyRole =
  | "defendant" // prévenu / accusé
  | "victim" // victime
  | "civil_party" // partie civile
  | "witness"; // témoin

@Table({ tableName: "CaseParties", timestamps: true, underscored: true })
export default class CaseParty extends Model {
  // ─── Dossier concerné ──────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  // ─── Personne impliquée ────────────────────────────────────────

  @ForeignKey(() => Person)
  @Column({ type: DataType.INTEGER, allowNull: false })
  personId!: number;

  @BelongsTo(() => Person, { as: "person" })
  person!: Person;

  // ─── Rôle dans le dossier ──────────────────────────────────────

  @Column({
    type: DataType.ENUM("defendant", "victim", "civil_party", "witness"),
    allowNull: false,
  })
  role!: CasePartyRole;

  // ─── Représentation légale ─────────────────────────────────────

  /**
   * Avocat représentant cette partie.
   * Nullable — toute partie n'a pas forcément un avocat.
   * FK vers User avec role=lawyer.
   */
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  representedById?: number;

  @BelongsTo(() => User, { as: "lawyer" })
  lawyer?: User;

  // ─── Métadonnées ───────────────────────────────────────────────

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  addedAt!: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
