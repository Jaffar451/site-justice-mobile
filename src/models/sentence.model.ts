import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import Decision from './decision.model';
import Court from './court.model';
import User from './user.model';

@Table({ tableName: 'Sentences', timestamps: true, underscored: true })
export default class Sentence extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @ForeignKey(() => Decision)
  @Column({ type: DataType.INTEGER, allowNull: false })
  decisionId!: number;

  @BelongsTo(() => Decision, { as: 'decision' })
  decision!: Decision;

  @ForeignKey(() => Court)
  @Column({ type: DataType.INTEGER, allowNull: false })
  courtId!: number;

  @BelongsTo(() => Court, { as: 'court' })
  court!: Court;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  judgeId!: number;

  @BelongsTo(() => User, { as: 'judge' })
  judge!: User;
  
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  firmYears!: number;
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  firmMonths!: number;
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  firmDays!: number;
  
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  suspendedYears!: number;
  @Column({ type: DataType.INTEGER, defaultValue: 0 })
  suspendedMonths!: number;
  
  @Column({ type: DataType.DECIMAL(15, 2), defaultValue: 0 })
  fineAmount!: number;
  @Column({ type: DataType.DECIMAL(15, 2), defaultValue: 0 })
  damagesAmount!: number;
  
  @Column({ type: DataType.ENUM("pending", "executing", "completed", "suspended"), defaultValue: "pending" })
  status!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  sentenceDate!: Date;

  @Column({ type: DataType.TEXT, allowNull: true })
  observations?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}