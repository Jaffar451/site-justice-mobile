import { Table, Column, Model, DataType, HasMany, BelongsTo, ForeignKey, HasOne, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Complaint from './complaint.model';
import Assignment from './assignment.model';
import Decision from './decision.model';
import Hearing from './hearing.model';
import Incarceration from './incarceration.model';
import Court from './court.model';
import Evidence from './evidence.model';
import Attachment from './attachment.model';
import ProcesVerbal from './procesVerbal.model';

export type CaseType = "criminal" | "civil" | "other";
export type CaseStatus = "open" | "closed" | "archived";
export type CasePriority = "low" | "medium" | "high";
export type CaseStage = "police_investigation" | "prosecution_review" | "trial" | "appeal" | "execution" | "archived";

@Table({ tableName: 'Cases', timestamps: true, underscored: true })
export default class CaseModel extends Model {

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  reference!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.ENUM("criminal", "civil", "other"), defaultValue: "criminal" })
  type!: CaseType;

  @Column({ type: DataType.ENUM("low", "medium", "high"), defaultValue: "medium" })
  priority!: CasePriority;

  @Column({ type: DataType.ENUM("open", "closed", "archived"), defaultValue: "open" })
  status!: CaseStatus;

  @Column({ type: DataType.ENUM("police_investigation", "prosecution_review", "trial", "appeal", "execution", "archived"), defaultValue: "prosecution_review" })
  stage!: CaseStage;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  openedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  closedAt?: Date;

  // --- RELATIONS ---
  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: false, unique: true })
  complaintId!: number;

  @BelongsTo(() => Complaint, { as: 'sourceComplaint' })
  sourceComplaint?: Complaint;

  @ForeignKey(() => Court)
  @Column({ type: DataType.INTEGER, allowNull: false })
  courtId!: number;

  @BelongsTo(() => Court, { as: 'court' })
  court!: Court;

  @HasMany(() => Assignment, { as: 'assignments' })
  assignments!: Assignment[];

  @HasMany(() => Decision, { as: 'caseDecisions' }) // Alias unifié
  caseDecisions!: Decision[];

  @HasMany(() => Hearing, { as: 'caseHearings' }) // Alias unifié
  caseHearings!: Hearing[];

  @HasMany(() => Evidence, { as: 'evidence' })
  evidence!: Evidence[];

  @HasMany(() => Attachment, { as: 'attachments' })
  attachments!: Attachment[];

  @HasMany(() => ProcesVerbal, { as: 'procesVerbaux' })
  procesVerbaux!: ProcesVerbal[];

  @HasOne(() => Incarceration, { as: 'incarcerationRecord' })
  incarcerationRecord?: Incarceration;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}