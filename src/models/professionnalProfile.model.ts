// src/models/professionalProfile.model.ts

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

export type ProfessionalType =
  | "prosecutor"
  | "judge"
  | "clerk"
  | "police"
  | "lawyer"
  | "prison_staff";

export type JudgeSpecialization = "instruction" | "trial" | "both" | null;

export type InstitutionType =
  | "court"
  | "police_station"
  | "prison"
  | "bar_association"; // barreau pour les avocats

@Table({
  tableName: "ProfessionalProfiles",
  timestamps: true,
  underscored: true,
})
export default class ProfessionalProfile extends Model {
  // ─── Type de professionnel ─────────────────────────────────────

  @Column({
    type: DataType.ENUM(
      "prosecutor",
      "judge",
      "clerk",
      "police",
      "lawyer",
      "prison_staff",
    ),
    allowNull: false,
  })
  type!: ProfessionalType;

  /**
   * Spécialisation pour les juges uniquement.
   * - instruction : juge d'instruction uniquement
   * - trial       : juge du siège uniquement
   * - both        : habilité aux deux
   * null pour tous les autres types.
   */
  @Column({
    type: DataType.ENUM("instruction", "trial", "both"),
    allowNull: true,
  })
  judgeSpecialization?: JudgeSpecialization;

  // ─── Identification professionnelle ────────────────────────────

  @Column({ type: DataType.STRING, allowNull: true })
  matricule?: string; // Numéro de matricule institutionnel

  @Column({ type: DataType.STRING, allowNull: true })
  barNumber?: string; // Numéro de barreau (avocat uniquement)

  @Column({ type: DataType.STRING, allowNull: true })
  title?: string; // "Procureur de la République", "Juge d'instruction"

  // ─── Institution d'appartenance ────────────────────────────────

  @Column({
    type: DataType.ENUM("court", "police_station", "prison", "bar_association"),
    allowNull: false,
  })
  institutionType!: InstitutionType;

  /**
   * ID de l'institution dans sa table respective.
   * Court.id si institutionType='court'
   * PoliceStation.id si institutionType='police_station'
   * Prison.id si institutionType='prison'
   * Pas de FK générique possible — vérification applicative.
   */
  @Column({ type: DataType.INTEGER, allowNull: false })
  institutionId!: number;

  // ─── Statut ────────────────────────────────────────────────────

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  isActive!: boolean;

  @Column({ type: DataType.DATE, allowNull: true })
  appointedAt?: Date; // Date de prise de fonction

  @Column({ type: DataType.DATE, allowNull: true })
  endedAt?: Date; // Date de fin de fonction

  // ─── Lien vers User ────────────────────────────────────────────

  /**
   * Relation ajoutée après réécriture de User (Étape 2).
   * Pour l'instant : integer brut pour éviter l'import circulaire.
   */
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  userId!: number;
  // @ForeignKey(() => User) sera activé à l'Étape 2
  // @BelongsTo(() => User, { as: 'user' }) idem

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
