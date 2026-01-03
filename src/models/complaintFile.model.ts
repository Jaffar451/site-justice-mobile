import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import Complaint from './complaint.model';

@Table({ tableName: 'ComplaintFiles', timestamps: false, underscored: true })
export default class ComplaintFile extends Model {

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: false })
  complaintId!: number;

  @BelongsTo(() => Complaint, { as: 'parentComplaint' })
  parentComplaint!: Complaint;

  @Column({ type: DataType.STRING, allowNull: false })
  filename!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  originalName!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  mimeType!: string;

  @Column({ type: DataType.INTEGER, allowNull: false })
  size!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  path!: string;
}