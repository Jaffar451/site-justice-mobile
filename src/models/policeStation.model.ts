import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import Complaint from './complaint.model';
import SosAlert from './sosAlert.model';

@Table({ tableName: 'police_stations', timestamps: true, underscored: true })
export default class PoliceStation extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.ENUM("POLICE", "GENDARMERIE"), defaultValue: "POLICE" })
  type!: "POLICE" | "GENDARMERIE";

  @Column({ type: DataType.STRING, defaultValue: "Niamey" })
  city!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  district?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  // --- RELATIONS ---
  @HasMany(() => User, { as: 'agents' })
  agents!: User[];

  @HasMany(() => Complaint, { as: 'receivedComplaints' })
  receivedComplaints!: Complaint[];

  @HasMany(() => SosAlert, { as: 'receivedAlerts' })
  receivedAlerts!: SosAlert[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}