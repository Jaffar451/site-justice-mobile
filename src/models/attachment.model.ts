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
import CaseModel from "./case.model";
import User from "./user.model";
import Complaint from "./complaint.model"; // 👈 1. Ajoute l'import

@Table({ tableName: "Attachments", timestamps: true, underscored: true })
export default class Attachment extends Model {
  // --- RELATION AVEC LA PLAINTE (Ce qui manquait) ---
  @ForeignKey(() => Complaint) // 👈 2. Déclare la clé étrangère
  @Column({ type: DataType.INTEGER, allowNull: true }) // allowNull: true car un fichier peut être lié à un Case OU une Complaint
  complaintId!: number;

  @BelongsTo(() => Complaint, { as: "complaint" }) // 👈 3. Déclare le lien inverse
  complaint!: Complaint;

  // --- RELATION AVEC LE DOSSIER (Déjà présent) ---
  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: true }) // Changé en true pour la flexibilité
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: "case" })
  case!: CaseModel;

  // --- INFOS FICHIER ---
  @Column({ type: DataType.STRING, allowNull: false })
  filename!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  fileUrl!: string;

  // --- TRAÇABILITÉ ---
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  uploadedBy!: number;

  @BelongsTo(() => User, { as: "uploader" })
  uploader!: User;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
