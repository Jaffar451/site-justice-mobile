import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Detainee from './detainee.model';
import Prison from './prison.model';
import CaseModel from './case.model';

@Table({ tableName: 'incarcerations', timestamps: true, underscored: true })
export default class Incarceration extends Model {
  
  @ForeignKey(() => Detainee)
  @Column({ type: DataType.INTEGER, allowNull: false })
  detaineeId!: number;

  @BelongsTo(() => Detainee, { as: 'detaineeData' })
  detaineeData!: Detainee;

  @ForeignKey(() => Prison)
  @Column({ type: DataType.INTEGER, allowNull: false })
  prisonId!: number;

  @BelongsTo(() => Prison, { as: 'detentionCenter' })
  detentionCenter!: Prison;

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: true })
  caseId?: number;

  @BelongsTo(() => CaseModel, { as: 'legalBasis' })
  legalBasis?: CaseModel;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  entryDate!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  expectedReleaseDate?: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  actualReleaseDate?: Date;

  @Column({ type: DataType.ENUM("preventive", "convicted", "released", "escaped"), defaultValue: "preventive" })
  status!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  cellNumber?: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  observation?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}