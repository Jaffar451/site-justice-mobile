import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import PoliceStation from './policeStation.model';

@Table({ tableName: 'SosAlerts', timestamps: true, underscored: true })
export default class SosAlert extends Model {

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User, { as: 'sender' })
  sender!: User;

  @ForeignKey(() => PoliceStation)
  @Column({ type: DataType.INTEGER, allowNull: false })
  policeStationId!: number;

  @BelongsTo(() => PoliceStation, { as: 'targetStation' })
  targetStation!: PoliceStation;

  @Column({ type: DataType.FLOAT, allowNull: false })
  latitude!: number;

  @Column({ type: DataType.FLOAT, allowNull: false })
  longitude!: number;

  @Column({ type: DataType.ENUM('pending', 'dispatched', 'resolved'), defaultValue: 'pending' })
  status!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}