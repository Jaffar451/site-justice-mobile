import {
  Table,
  Column,
  Model,
  DataType,
  BelongsTo,
  ForeignKey,
  HasOne,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import User from "./user.model";
import PoliceStation from "./policeStation.model";
import CaseModel from "./case.model";
import ComplaintFile from "./complaintFile.model";
import OffenseCategory from "./offenseCategory.model";
import Attachment from "./attachment.model";

export type ComplaintStatus =
  | "soumise"
  | "en_cours_OPJ"
  | "attente_validation"
  | "transmise_parquet"
  | "classée_sans_suite_par_OPJ"
  | "classée_sans_suite_par_procureur"
  | "figée";

@Table({ tableName: "Complaints", timestamps: true, underscored: true })
export default class Complaint extends Model {
  @Column({ type: DataType.STRING, defaultValue: "Plainte sans titre" })
  title!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @Column({ type: DataType.STRING, defaultValue: "general" })
  category!: string;

  @Column({
    type: DataType.ENUM(
      "soumise",
      "en_cours_OPJ",
      "attente_validation",
      "transmise_parquet",
      "classée_sans_suite_par_OPJ",
      "classée_sans_suite_par_procureur",
      "figée",
    ),
    defaultValue: "soumise",
  })
  status!: ComplaintStatus;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  filedAt!: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  location?: string;

  @Column({ type: DataType.DECIMAL(10, 8), allowNull: true })
  latitude?: number;

  @Column({ type: DataType.DECIMAL(11, 8), allowNull: true })
  longitude?: number;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  validatedByCommissaire!: boolean;

  @Column({ type: DataType.STRING, allowNull: true })
  caseNumber?: string;

  @Column({ type: DataType.STRING, unique: true })
  trackingCode!: string;

  @Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4, unique: true })
  verification_token!: string;

  // --- RELATIONS ---

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  citizenId!: number;

  @BelongsTo(() => User, { as: "complainant" })
  complainant!: User;

  @ForeignKey(() => PoliceStation)
  @Column({ type: DataType.INTEGER, allowNull: true })
  policeStationId?: number;

  @BelongsTo(() => PoliceStation, { as: "originStation" })
  originStation?: PoliceStation;

  // OPJ assigné à l'enquête — manquait dans l'original
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  assignedOpjId?: number;

  @BelongsTo(() => User, { as: "assignedOPJ" })
  assignedOPJ?: User;

  // Supprimé : assignedJudgeId — le juge appartient au Case, pas à la Complaint

  // Qualification provisoire — catégorie large seulement
  // L'article précis est qualifié par le procureur dans CaseQualification
  @ForeignKey(() => OffenseCategory)
  @Column({ type: DataType.INTEGER, allowNull: true })
  offenseCategoryId?: number;

  @BelongsTo(() => OffenseCategory, { as: "offenseCategory" })
  offenseCategory?: OffenseCategory;

  @HasOne(() => CaseModel, { as: "judicialCase" })
  judicialCase?: CaseModel;

  @HasMany(() => ComplaintFile, { as: "attachedFiles" })
  attachedFiles!: ComplaintFile[];

  @HasMany(() => Attachment, { as: "attachments" })
  attachments!: Attachment[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}
