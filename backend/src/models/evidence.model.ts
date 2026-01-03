import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import User from './user.model';

@Table({ tableName: 'Evidence', freezeTableName: true, timestamps: true, underscored: true })
export default class Evidence extends Model {
  
  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  uploaderId!: number;

  @BelongsTo(() => User, { as: 'uploadedBy' })
  uploadedBy!: User;

  @Column({ type: DataType.STRING, allowNull: false })
  filename!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  type!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  description?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  fileUrl?: string;

  @Column({ type: DataType.ENUM("sealed", "opened", "transferred", "archived"), defaultValue: "sealed" })
  chainOfCustodyStatus!: string;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  uploadedAt!: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  hash!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  originOfficerId?: number;

  @BelongsTo(() => User, { as: 'originOfficer' })
  originOfficer?: User;

  @Column({ type: DataType.STRING, allowNull: true })
  seizureLocation?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}