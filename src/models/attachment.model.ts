import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import User from './user.model';

@Table({ tableName: 'Attachments', timestamps: true, underscored: true })
export default class Attachment extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'case' })
  case!: CaseModel;

  @Column({ type: DataType.STRING, allowNull: false })
  filename!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  fileUrl!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  uploadedBy!: number;

  @BelongsTo(() => User, { as: 'uploader' })
  uploader!: User;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}