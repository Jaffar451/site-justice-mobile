import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Complaint from './complaint.model';
import User from './user.model';

@Table({ tableName: 'Indictments', timestamps: true, underscored: true })
export default class Indictment extends Model {

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: false })
  complaintId!: number;

  @BelongsTo(() => Complaint, { as: 'complaint' })
  complaint!: Complaint;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  judgeId!: number;

  @BelongsTo(() => User, { as: 'judge' })
  judge!: User;

  @Column({ type: DataType.DATE, allowNull: false })
  date!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  charges!: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  observations?: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}