// src/models/witness.model.ts

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
import Person from "./person.model";
import Hearing from "./hearing.model";
import CaseModel from "./case.model";

@Table({ tableName: "Witnesses", timestamps: true, underscored: true })
export default class Witness extends Model {
  // ─── Identité du témoin ────────────────────────────────────────

  @ForeignKey(() => Person)
  @Column({ type: DataType.INTEGER, allowNull: false })
  personId!: number;

  @BelongsTo(() => Person, { as: "person" })
  person!: Person;

  // ─── Audience liée ─────────────────────────────────────────────

  @ForeignKey(() => Hearing)
  @Column({ type: DataType.INTEGER, allowNull: false })
  hearingId!: number;

  @BelongsTo(() => Hearing, { as: "hearing" })
  hearing!: Hearing;

  // ─── Dossier lié ───────────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  caseId?: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case?: CaseModel;

  // ─── Déposition ────────────────────────────────────────────────

  @Column({ type: DataType.TEXT, allowNull: false })
  statement!: string;

  @Column({
    type: DataType.ENUM("favorable", "défavorable", "neutre"),
    allowNull: true,
  })
  statementType?: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isAnonymous!: boolean; // protection témoin si nécessaire

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
