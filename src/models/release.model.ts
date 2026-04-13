// src/models/release.model.ts

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
import User from "./user.model";

@Table({ tableName: "Releases", timestamps: true, underscored: true })
export default class Release extends Model {
  // ─── Personne libérée ──────────────────────────────────────────

  @ForeignKey(() => Person)
  @Column({ type: DataType.INTEGER, allowNull: false })
  suspectId!: number;

  @BelongsTo(() => Person, { as: "suspect" })
  suspect!: Person;

  // ─── Décision qui ordonne la libération ────────────────────────

  @ForeignKey(() => Decision)
  @Column({ type: DataType.INTEGER, allowNull: true })
  decisionId?: number;

  @BelongsTo(() => Decision, { as: "decision" })
  decision?: Decision;

  // ─── Dossier lié ───────────────────────────────────────────────

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  caseId?: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case?: CaseModel;

  // ─── Libération ────────────────────────────────────────────────

  @Column({ type: DataType.DATE, allowNull: false })
  releaseDate!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({
    type: DataType.ENUM("liberté", "liberté_provisoire", "liberté_surveillée"),
    defaultValue: "liberté",
  })
  releaseType!: string;

  // ─── Agent qui exécute la libération ───────────────────────────

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  releasedById?: number;

  @BelongsTo(() => User, { as: "releasedBy" })
  releasedBy?: User;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
