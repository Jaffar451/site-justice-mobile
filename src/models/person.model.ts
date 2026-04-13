// backend/src/models/person.model.ts

import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  HasOne,
  BelongsTo,
  ForeignKey,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";

/**
 * Person — identité physique réelle d'un individu.
 *
 * Distinct de User (compte système).
 * Un accusé arrêté sans smartphone est une Person sans User.
 * Un citoyen qui dépose une plainte est Person + User (liés via userId).
 */
@Table({ tableName: "Persons", timestamps: true, underscored: true })
export default class Person extends Model {
  // ─── Identité civile ───────────────────────────────────────────

  @Column({ type: DataType.STRING, allowNull: false })
  firstName!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastName!: string;

  @Column({ type: DataType.ENUM("M", "F", "autre"), allowNull: true })
  gender?: string;

  @Column({ type: DataType.DATEONLY, allowNull: true })
  dateOfBirth?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  placeOfBirth?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  nationality?: string;

  // ─── Documents d'identité ──────────────────────────────────────

  /**
   * Numéro CNI / passeport — unique si renseigné.
   * allowNull: true car un inconnu n'a pas encore de pièce vérifiée.
   */
  @Column({ type: DataType.STRING, allowNull: true, unique: true })
  nationalId?: string;

  @Column({
    type: DataType.ENUM("cni", "passeport", "permis", "autre"),
    allowNull: true,
  })
  idDocumentType?: string;

  // ─── Coordonnées ───────────────────────────────────────────────

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  email?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  district?: string; // quartier / commune

  @Column({ type: DataType.STRING, allowNull: true })
  city?: string;

  // ─── Lien optionnel vers un compte utilisateur ─────────────────

  /**
   * Nullable — un accusé ou témoin n'a pas de compte.
   * Un citoyen connecté a un userId.
   * Contrainte unique : 1 User = 1 Person max.
   */
  @Column({ type: DataType.INTEGER, allowNull: true, unique: true })
  userId?: number;
  // Note : BelongsTo(() => User) sera ajouté après la réécriture de User
  // pour éviter les imports circulaires durant la migration.

  // ─── Métadonnées ───────────────────────────────────────────────

  /**
   * Indique si l'identité a été vérifiée par un agent (OPJ, greffier).
   * false = déclarative (auto-déclaré par le citoyen ou OPJ de mémoire).
   */
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  isIdentityVerified!: boolean;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string; // observations OPJ, signalement particulier

  // ─── Relations ─────────────────────────────────────────────────
  // Importées après création des modèles dépendants (CaseParty, Complaint)
  // pour éviter les dépendances circulaires.
  // Elles seront ajoutées en Étape 4 :
  //
  // @HasMany(() => CaseParty, { as: 'caseInvolvements' })
  // caseInvolvements!: CaseParty[];
  //
  // @HasMany(() => Complaint, { as: 'filedComplaints' })
  // filedComplaints!: Complaint[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
