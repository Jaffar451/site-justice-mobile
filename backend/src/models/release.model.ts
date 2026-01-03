import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Releases', timestamps: true, underscored: true })
export default class Release extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  suspectId!: number;

  @Column({ type: DataType.TEXT, allowNull: false })
  reason!: string;

  @Column({ type: DataType.DATE, allowNull: false })
  releaseDate!: Date;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}