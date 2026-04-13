import {
  Table,
  Column,
  Model,
  DataType,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import User from "./user.model";
import Complaint from "./complaint.model";
import SosAlert from "./sosAlert.model";

@Table({ 
  tableName: "police_stations", 
  timestamps: true, 
  underscored: false // Désactivé pour correspondre à votre structure réelle
})
export default class PoliceStation extends Model {
  @Column({ type: DataType.INTEGER, primaryKey: true, autoIncrement: true })
  id!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  // Assurez-vous que l'ENUM correspond exactement à ce qui est en base
  @Column({
    type: DataType.STRING, // Souvent plus simple que l'ENUM natif si les noms diffèrent
    defaultValue: "POLICE",
  })
  type!: string;

  @Column({ type: DataType.STRING, defaultValue: "Niamey" })
  city!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  district?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  address?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  phone?: string;

  // --- RELATIONS ---
  @HasMany(() => User, { foreignKey: "police_station_id" })
  agents!: User[];

  @HasMany(() => Complaint, { foreignKey: "police_station_id" })
  receivedComplaints!: Complaint[];

  @HasMany(() => SosAlert, { foreignKey: "police_station_id" })
  receivedAlerts!: SosAlert[];

  @CreatedAt 
  @Column({ type: DataType.DATE, field: "created_at" }) 
  createdAt!: Date;

  @UpdatedAt 
  @Column({ type: DataType.DATE, field: "updated_at" }) 
  updatedAt!: Date;
}