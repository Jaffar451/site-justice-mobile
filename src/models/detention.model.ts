import { Table, Column, Model, DataType, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'Detentions', timestamps: true, underscored: true })
export default class Detention extends Model {
  @Column({ type: DataType.INTEGER, allowNull: false })
  suspectId!: number;

  @Column({ type: DataType.INTEGER, allowNull: false })
  decisionId!: number;

  @Column({ type: DataType.DATE, allowNull: false })
  dateDebut!: Date;

  @Column({ type: DataType.DATE, allowNull: false })
  dateFin!: Date;

  @Column({ type: DataType.TEXT, allowNull: false })
  motif!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lieuDetention!: string;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}