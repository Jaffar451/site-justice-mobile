import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Witnesses', timestamps: true, underscored: true })
export default class Witness extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  hearingId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  fullName!: string;

  @Column({ type: DataType.TEXT, allowNull: false })
  statement!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}