// src/models/detention.model.ts

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
import Decision from "./decision.model";
import CaseModel from "./case.model";

@Table({ tableName: "Detentions", timestamps: true, underscored: true })
export default class Detention extends Model {
  // ─── Détenu ────────────────────────────────────────────────────

  @ForeignKey(() => Person)
  @Column({ type: DataType.INTEGER, allowNull: false })
  suspectId!: number;

  @BelongsTo(() => Person, { as: "suspect" })
  suspect!: Person;

  // ─── Décision qui ordonne la détention ─────────────────────────

  @ForeignKey(() => Decision)
  @Column({ type: DataType.INTEGER, allowNull: false })
  decisionId!: number;

  @BelongsTo(() => Decision, { as: "decision" })
  decision!: Decision;

  // ─── Dossier lié ───────────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  caseId?: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case?: CaseModel;

  // ─── Période de détention ──────────────────────────────────────

  @Column({ type: DataType.DATE, allowNull: false })
  dateDebut!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  dateFin?: Date;

  @Column({
    type: DataType.ENUM("provisoire", "ferme", "terminée", "annulée"),
    defaultValue: "provisoire",
  })
  status!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  motif!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lieuDetention!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
