import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Confiscations', timestamps: true, underscored: true })
export default class Confiscation extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  item!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  reason!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  confiscatedAt!: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}