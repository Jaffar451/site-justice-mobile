import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'CustodyExtensions', timestamps: true, underscored: true })
export default class CustodyExtension extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  suspectId!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  requestedBy!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  newEndDate!: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}