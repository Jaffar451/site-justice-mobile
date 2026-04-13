// src/models/offense.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

import OffenseCategory from "./offenseCategory.model";
import OffenseCircumstance from "./offenseCircumstance.model";

export type ProceduralRoute = "parquet" | "instruction" | "direct_trial";

@Table({ tableName: "Offenses", timestamps: true, underscored: true })
export default class Offense extends Model {
  // ─── Référence légale ──────────────────────────────────────────

  /**
   * Code article unique — référence du code pénal nigérien.
   * Ex: "CP-221", "CP-379", "CS-2"
   * Immuable : si l'article change, on crée une nouvelle entrée
   * et on marque l'ancienne isActive=false + supersededById=nouvelId.
   */
  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  articleCode!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // "Homicide volontaire"

  @Column({ type: DataType.TEXT, allowNull: false })
  legalDefinition!: string; // Texte exact de l'article

  // ─── Classification ────────────────────────────────────────────

  @Column({
    type: DataType.ENUM("crime", "délit", "contravention"),
    allowNull: false,
  })
  type!: string;

  // ─── Peines légales ────────────────────────────────────────────

  @Column({ type: DataType.INTEGER, allowNull: true })
  minPenaltyMonths?: number;

  @Column({ type: DataType.INTEGER, allowNull: true })
  maxPenaltyMonths?: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  lifeImprisonment!: boolean; // Réclusion à perpétuité

  @Column({ type: DataType.DECIMAL(12, 2), allowNull: true })
  maxFineAmount?: number;

  // ─── Route procédurale ─────────────────────────────────────────

  /**
   * Détermine quel ProceduralTemplate est chargé à la création du Case.
   * - parquet       : affaire traitée au niveau parquet, pas d'instruction
   * - instruction   : nécessite un juge d'instruction
   * - direct_trial  : renvoi direct devant le tribunal correctionnel
   */
  @Column({
    type: DataType.ENUM("parquet", "instruction", "direct_trial"),
    allowNull: false,
    defaultValue: "parquet",
  })
  proceduralRoute!: ProceduralRoute;

  // ─── Versioning législatif ─────────────────────────────────────

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  /**
   * Si cet article a été modifié par le législateur,
   * pointe vers la nouvelle version.
   * L'ancienne version reste en base pour les dossiers historiques.
   */
  @Column({ type: DataType.INTEGER, allowNull: true })
  supersededById?: number;

  // ─── Catégorie ─────────────────────────────────────────────────

  @ForeignKey(() => OffenseCategory)
  @Column({ type: DataType.INTEGER, allowNull: false })
  categoryId!: number;

  @BelongsTo(() => OffenseCategory, { as: "category" })
  category!: OffenseCategory;

  // ─── Relations (activées après création des modèles dépendants) ─

  @HasMany(() => OffenseCircumstance, { as: "circumstances" })
  circumstances!: OffenseCircumstance[];

  // @HasMany(() => CaseQualification, { as: 'qualifications' })
  // qualifications!: CaseQualification[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
