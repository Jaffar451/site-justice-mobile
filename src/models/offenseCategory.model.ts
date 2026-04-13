// src/models/offenseCategory.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

import Offense from "./offense.model";

export type OffenseSeverity = "crime" | "délit" | "contravention";

@Table({ tableName: "OffenseCategories", timestamps: true, underscored: true })
export default class OffenseCategory extends Model {
  // ─── Identification ────────────────────────────────────────────

  /**
   * Code fonctionnel court — utilisé dans le code et les APIs.
   * Ex: "ATT_PERS", "ATT_BIENS", "ORDRE_PUB"
   */
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  code!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // "Atteintes aux personnes"

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  // ─── Classification légale ─────────────────────────────────────

  /**
   * Sévérité dominante de la catégorie.
   * Une catégorie peut contenir des crimes ET des délits —
   * ce champ indique la nature principale pour le filtrage UI.
   */
  @Column({
    type: DataType.ENUM("crime", "délit", "contravention"),
    allowNull: false,
  })
  severity!: OffenseSeverity;

  // ─── Affichage ─────────────────────────────────────────────────

  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  displayOrder!: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  // ─── Relations ─────────────────────────────────────────────────
  // Importé après création de offense.model.ts (Étape suivante)
  @HasMany(() => Offense, { as: "offenses" })
  offenses!: Offense[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
