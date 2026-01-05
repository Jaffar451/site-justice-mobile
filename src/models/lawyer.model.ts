import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'lawyers', timestamps: true })
export class Lawyer extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  firstname!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastname!: string;

  @Column({ type: DataType.STRING })
  specialization!: string; // Ex: "Pénal", "Affaires", "Famille"

  @Column({ type: DataType.STRING })
  city!: string;

  @Column({ type: DataType.STRING })
  phone!: string;

  @Column({ type: DataType.STRING })
  email!: string;

  @Column({ type: DataType.STRING })
  address!: string;
}