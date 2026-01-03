import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import Court from './court.model';
import User from './user.model';

@Table({ tableName: 'Hearings', timestamps: true, underscored: true })
export default class Hearing extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @ForeignKey(() => Court)
  @Column({ type: DataType.INTEGER, allowNull: false })
  courtId!: number;

  @BelongsTo(() => Court, { as: 'court' })
  court!: Court;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  judgeId?: number;

  @BelongsTo(() => User, { as: 'judge' })
  judge?: User;

  @Column({ type: DataType.DATE, allowNull: false })
  date!: Date;

  @Column({ type: DataType.STRING, allowNull: true })
  type?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  courtroom?: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  durationMinutes?: number;

  @Column({ type: DataType.TEXT, allowNull: true })
  notes?: string;

  @Column({ type: DataType.ENUM("scheduled", "postponed", "held", "canceled"), defaultValue: "scheduled" })
  status!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}