import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Reparations', timestamps: true, underscored: true })
export default class Reparation extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @Column({ type: DataType.STRING, allowNull: false })
  beneficiary!: string;

  @Column({ type: DataType.FLOAT, allowNull: false })
  amount!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}