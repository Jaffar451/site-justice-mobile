// src/models/offenseCircumstance.model.ts

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
import Offense from "./offense.model";

export type CircumstanceType = "aggravating" | "mitigating";

@Table({
  tableName: "OffenseCircumstances",
  timestamps: true,
  underscored: true,
})
export default class OffenseCircumstance extends Model {
  // ─── Contenu ───────────────────────────────────────────────────

  @Column({
    type: DataType.ENUM("aggravating", "mitigating"),
    allowNull: false,
  })
  type!: CircumstanceType;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // "Préméditation", "Minorité de la victime", "Récidive"

  @Column({ type: DataType.TEXT, allowNull: true })
  legalBasis?: string; // Référence article exact du code pénal

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  // ─── Effet sur la peine ────────────────────────────────────────

  /**
   * Modificateur appliqué à la peine en cas de retenue.
   * Ex: +24 mois si aggravant, -6 mois si atténuant.
   * Purement indicatif — c'est le juge qui décide.
   */
  @Column({ type: DataType.INTEGER, allowNull: true })
  penaltyModifierMonths?: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  // ─── Relation ──────────────────────────────────────────────────

  @ForeignKey(() => Offense)
  @Column({ type: DataType.INTEGER, allowNull: false })
  offenseId!: number;

  @BelongsTo(() => Offense, { as: "offense" })
  offense!: Offense;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
