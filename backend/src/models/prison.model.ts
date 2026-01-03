import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import Incarceration from './incarceration.model';

@Table({ tableName: 'prisons', timestamps: true, underscored: true })
export default class Prison extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  city!: string;

  @Column({ type: DataType.STRING, defaultValue: "Maison d'Arrêt" })
  type!: string;

  @Column({ type: DataType.INTEGER, allowNull: true })
  capacity?: number;

  @Column({ type: DataType.ENUM("active", "inactive"), defaultValue: "active" })
  status!: string;

  // --- RELATIONS ---
  @HasMany(() => User, { as: 'staff' })
  staff!: User[];

  @HasMany(() => Incarceration, { as: 'inmates' }) // Alias unifié
  inmates!: Incarceration[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}