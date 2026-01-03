import { Table, Column, Model, DataType, HasMany, HasOne, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import Incarceration from './incarceration.model';
import User from './user.model';

@Table({ tableName: 'detainees', timestamps: true, underscored: true })
export default class Detainee extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  firstname!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastname!: string;

  @Column({ type: DataType.DATEONLY, allowNull: false })
  birthDate!: Date;

  @Column({ type: DataType.ENUM("M", "F"), allowNull: false })
  gender!: string;

  @Column({ type: DataType.STRING, defaultValue: "Nigérienne" })
  nationality!: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  niu?: string;

  @Column({ type: DataType.STRING, allowNull: true })
  photoUrl?: string;

  // --- RELATIONS ---
  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: true })
  userId?: number;

  @BelongsTo(() => User, { as: 'identity' })
  identity?: User;

  @HasMany(() => Incarceration, { as: 'incarcerations' })
  incarcerations!: Incarceration[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}