import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import Complaint from './complaint.model';

@Table({ tableName: 'PreventiveDetentions', timestamps: true, underscored: true })
export default class PreventiveDetention extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  suspectName!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  startedAt!: Date;

  @Column({ type: DataType.DATE, allowNull: true })
  endedAt?: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  location!: string;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  orderedBy!: number;

  @BelongsTo(() => User, { as: 'judge' })
  judge!: User;

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: true })
  complaintId?: number;

  @BelongsTo(() => Complaint, { as: 'complaint' })
  complaint?: Complaint;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}