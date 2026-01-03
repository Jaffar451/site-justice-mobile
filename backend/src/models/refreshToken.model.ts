import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';

@Table({ tableName: 'refresh_tokens', timestamps: true, underscored: true })
export default class RefreshToken extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  token!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  expiryDate!: Date;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User, { as: 'account' })
  account!: User;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}