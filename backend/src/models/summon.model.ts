import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Complaint from './complaint.model';
import User from './user.model';

@Table({ tableName: 'Summons', timestamps: true, underscored: true })
export default class Summon extends Model {

  @ForeignKey(() => Complaint)
  @Column({ type: DataType.INTEGER, allowNull: false })
  complaintId!: number;

  @BelongsTo(() => Complaint, { as: 'complaint' })
  complaint!: Complaint;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  issuedBy!: number;

  @BelongsTo(() => User, { as: 'officer' })
  officer!: User;

  @Column({ type: DataType.STRING, allowNull: false })
  targetName!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  targetPhone?: string;

  @Column({ type: DataType.DATE, allowNull: false })
  scheduledAt!: Date;

  @Column({ type: DataType.STRING, allowNull: false })
  location!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  reason?: string;

  @Column({ type: DataType.ENUM("envoyée", "reçue", "non_remise", "ignorée", "reportée", "effectuée"), defaultValue: "envoyée" })
  status!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}