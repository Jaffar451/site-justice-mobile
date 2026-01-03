import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import Complaint from './complaint.model';

@Table({ tableName: 'warrants', timestamps: true, underscored: true })
export default class Warrant extends Model {
  @Column({ type: DataType.ENUM('amener', 'dépôt', 'arrestation'), allowNull: false })
  type!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  issuedBy!: number;

  @BelongsTo(() => User, { as: 'issuedByUser' })
  issuedByUser!: User;

  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  issuedAt!: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  targetName!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({ type: DataType.ENUM('émis', 'exécuté', 'annulé'), defaultValue: 'émis' })
  status!: string;

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: true })
  relatedComplaintId?: number;

  @BelongsTo(() => Complaint, { as: 'complaint' })
  complaint?: Complaint;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}