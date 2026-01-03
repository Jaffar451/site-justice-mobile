import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Appeals', timestamps: true, underscored: true })
export default class Appeal extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  appealDate!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({ type: DataType.ENUM("pending", "accepted", "rejected"), defaultValue: "pending" })
  status!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}