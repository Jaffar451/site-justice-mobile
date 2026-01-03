import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Prosecutions', timestamps: true, underscored: true })
export default class Prosecution extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  complaintId!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  prosecutorId!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  date!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  description!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}