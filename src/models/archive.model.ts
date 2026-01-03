import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import CaseModel from './case.model';

@Table({ tableName: 'Archives', timestamps: true, underscored: true })
export default class Archive extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  archivedByUserId!: number;

  @BelongsTo(() => User, { as: 'archiver' })
  archiver!: User;

  @Column({ type: DataType.JSONB, allowNull: false })
  caseData!: object;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;
  
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  archivedAt!: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}