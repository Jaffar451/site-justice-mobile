// src/models/warrant.model.ts

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
import User from "./user.model";
import Complaint from "./complaint.model";
import Person from "./person.model";
import CaseModel from "./case.model";

export type WarrantType = "amener" | "dépôt" | "arrestation";
export type WarrantStatus = "émis" | "exécuté" | "annulé";

@Table({ tableName: "Warrants", timestamps: true, underscored: true })
export default class Warrant extends Model {
  // ─── Type et statut ────────────────────────────────────────────

  // Encodage UTF-8 corrigé — les accents étaient corrompus
  @Column({
    type: DataType.ENUM("amener", "dépôt", "arrestation"),
    allowNull: false,
  })
  type!: WarrantType;

  @Column({
    type: DataType.ENUM("émis", "exécuté", "annulé"),
    defaultValue: "émis",
  })
  status!: WarrantStatus;

  // ─── Cible du mandat ───────────────────────────────────────────

  // targetName STRING remplacé par FK Person
  @ForeignKey(() => Person)
  @Column({ type: DataType.INTEGER, allowNull: false })
  targetPersonId!: number;

  @BelongsTo(() => Person, { as: "targetPerson" })
  targetPerson!: Person;

  // ─── Émission ──────────────────────────────────────────────────

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  issuedBy!: number;

  @BelongsTo(() => User, { as: "issuedByUser" })
  issuedByUser!: User;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  issuedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  executedAt?: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  // ─── Dossiers liés ─────────────────────────────────────────────

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: true })
  relatedComplaintId?: number;

  @BelongsTo(() => Complaint, { as: "complaint" })
  complaint?: Complaint;

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  relatedCaseId?: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case?: CaseModel;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
