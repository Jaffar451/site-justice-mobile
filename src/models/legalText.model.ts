import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({ tableName: 'legal_texts', timestamps: true })
export class LegalText extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  title!: string; // Ex: "Code Pénal"

  @Column({ type: DataType.STRING })
  description!: string;

  @Column({ type: DataType.STRING }) // "LOI", "ANNUAIRE", "PROCEDURE"
  category!: string; 

  @Column({ type: DataType.STRING, allowNull: false })
  filename!: string; // Nom du fichier dans uploads/docs (ex: "code_penal.pdf")
}