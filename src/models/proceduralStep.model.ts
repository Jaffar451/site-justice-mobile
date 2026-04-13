// src/models/proceduralStep.model.ts

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
import ProceduralTemplate from "./proceduralTemplate.model";

export type StepRole =
  | "prosecutor"
  | "judge_instruction"
  | "judge_trial"
  | "clerk"
  | "police";

@Table({ tableName: "ProceduralSteps", timestamps: true, underscored: true })
export default class ProceduralStep extends Model {
  // ─── Contenu ───────────────────────────────────────────────────

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string; // "Notification à la victime", "Expertise médicale"

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  legalBasis?: string; // Référence article code procédure pénale

  // ─── Ordre et délai ────────────────────────────────────────────

  /**
   * Ordre d'exécution dans le template.
   * Les étapes sont présentées dans l'UI selon cet ordre.
   */
  @Column({ type: DataType.INTEGER, allowNull: false })
  order!: number;

  /**
   * Délai légal en jours à partir de l'ouverture du Case.
   * Ex: 48 pour la notification en garde à vue.
   */
  @Column({ type: DataType.INTEGER, allowNull: false })
  deadlineDays!: number;

  // ─── Responsabilité ────────────────────────────────────────────

  @Column({
    type: DataType.ENUM(
      "prosecutor",
      "judge_instruction",
      "judge_trial",
      "clerk",
      "police",
    ),
    allowNull: false,
  })
  requiredRole!: StepRole;

  /**
   * Si false : étape recommandée mais non bloquante.
   * Si true  : le dossier ne peut pas avancer sans cet acte.
   */
  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isMandatory!: boolean;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  // ─── Template parent ───────────────────────────────────────────

  @ForeignKey(() => ProceduralTemplate)
  @Column({ type: DataType.INTEGER, allowNull: false })
  templateId!: number;

  @BelongsTo(() => ProceduralTemplate, { as: "template" })
  template!: ProceduralTemplate;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
