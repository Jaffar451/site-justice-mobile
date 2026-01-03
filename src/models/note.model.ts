import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt } from 'sequelize-typescript';
import CaseModel from './case.model';
import User from './user.model';
import { encrypt, decrypt } from "../utils/encryption.util";
import crypto from "crypto";

@Table({ tableName: 'Notes', timestamps: false, underscored: true })
export default class Note extends Model {

  @ForeignKey(() => CaseModel)
  @Column({ type: DataType.INTEGER, allowNull: false })
  caseId!: number;

  @BelongsTo(() => CaseModel, { as: 'relatedCase' })
  relatedCase!: CaseModel;

  @ForeignKey(() => User)
  @Column({ type: DataType.INTEGER, allowNull: false })
  userId!: number;

  @BelongsTo(() => User, { as: 'author' })
  author!: User;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    get() {
      const isEncrypted = this.getDataValue("encrypted");
      const rawValue = this.getDataValue("content");
      if (isEncrypted && rawValue) {
        try { return decrypt(rawValue); } catch { return "[Erreur]"; }
      }
      return rawValue;
    },
    set(value: string) {
      this.setDataValue("encrypted", true);
      this.setDataValue("content", encrypt(value));
      this.setDataValue("hash", crypto.createHash("sha256").update(value).digest("hex"));
    }
  })
  content!: string;

  @Column({ type: DataType.ENUM("internal_prosecution", "internal_court", "case_global"), defaultValue: "case_global" })
  visibility!: string;

  @Column({ type: DataType.BOOLEAN, defaultValue: true })
  encrypted!: boolean;

  @Column({ type: DataType.STRING, allowNull: false, defaultValue: "" })
  hash!: string;

  @CreatedAt 
  @Column({ type: DataType.DATE, defaultValue: DataType.NOW })
  createdAt!: Date;
}