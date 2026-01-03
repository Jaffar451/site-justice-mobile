import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';
import CaseModel from './case.model';
import Hearing from './hearing.model';
import Decision from './decision.model';

@Table({ tableName: 'courts', timestamps: true, underscored: true })
export default class Court extends Model {
  @Column({ type: DataType.STRING, allowNull: false })
  name!: string;

  @Column({ type: DataType.STRING, defaultValue: "Niamey" })
  city!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  jurisdiction!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  type!: string;

  @Column({ type: DataType.ENUM("active", "inactive"), defaultValue: "active" })
  status!: string;

  // --- RELATIONS ---
  @HasMany(() => User, { as: 'personnelCourt' })
  personnelCourt!: User[];

  @HasMany(() => CaseModel, { as: 'courtCases' })
  courtCases!: CaseModel[];

  @HasMany(() => Hearing, { as: 'hearings' })
  hearings!: Hearing[];

  @HasMany(() => Decision, { as: 'decisions' })
  decisions!: Decision[];

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}