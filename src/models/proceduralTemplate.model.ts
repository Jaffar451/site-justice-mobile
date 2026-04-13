// src/models/proceduralTemplate.model.ts

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
import OffenseCategory from "./offenseCategory.model";

@Table({
  tableName: "ProceduralTemplates",
  timestamps: true,
  underscored: true,
})
export default class ProceduralTemplate extends Model {
  // ─── Identification ────────────────────────────────────────────

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // "Procédure crime avec instruction"

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  // ─── Critères de déclenchement ─────────────────────────────────

  /**
   * Catégorie d'infraction qui déclenche ce template.
   * Ex: toutes les infractions "ATT_PERS" utilisent ce template.
   */
  @ForeignKey(() => OffenseCategory)
  @Column({ type: DataType.INTEGER, allowNull: false })
  offenseCategoryId!: number;

  @BelongsTo(() => OffenseCategory, { as: "offenseCategory" })
  offenseCategory!: OffenseCategory;

  @Column({
    type: DataType.ENUM("criminal", "civil", "other"),
    allowNull: false,
    defaultValue: "criminal",
  })
  caseType!: string;

  /**
   * Route procédurale associée — doit correspondre à Offense.proceduralRoute.
   * Permet de choisir le bon template selon la qualification.
   */
  @Column({
    type: DataType.ENUM("parquet", "instruction", "direct_trial"),
    allowNull: false,
  })
  proceduralRoute!: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  // ─── Étapes ────────────────────────────────────────────────────
  // Activé après création de ProceduralStep
  // @HasMany(() => ProceduralStep, { as: 'steps' })
  // steps!: ProceduralStep[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
