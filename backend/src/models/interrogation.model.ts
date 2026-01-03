import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import Complaint from './complaint.model';

@Table({ tableName: 'Interrogations', timestamps: true, underscored: true })
export default class Interrogation extends Model {

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: false })
  complaintId!: number;

  @BelongsTo(() => Complaint, { as: 'complaint' })
  complaint!: Complaint;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  officerId!: number;

  @BelongsTo(() => User, { as: 'officer' })
  officer!: User;

  @Column({ type: DataType.STRING, allowNull: false })
  suspectName!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  date!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  summary!: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  signed!: boolean;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}