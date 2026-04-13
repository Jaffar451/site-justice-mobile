import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
} from "sequelize-typescript";
import User from "./user.model";

@Table({
  tableName: "audit_logs",
  underscored: true,
  timestamps: true,
})
export default class AuditLog extends Model {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    field: "user_id",
    allowNull: true,
  })
  userId!: number;

  @Column(DataType.STRING)
  action!: string;

  @Column(DataType.STRING)
  method!: string;

  @Column(DataType.STRING)
  endpoint!: string;

  // ✅ Mapping vers ip_address
  @Column({
    type: DataType.STRING,
    field: "ip_address",
  })
  ipAddress!: string;

  get ip(): string {
    return this.ipAddress;
  }

  @Column({
    type: DataType.ENUM("info", "warning", "critical"),
    defaultValue: "info",
  })
  severity!: "info" | "warning" | "critical";

  @Column({
    type: DataType.STRING,
    defaultValue: "SUCCESS",
  })
  status!: string;

  @Column(DataType.TEXT)
  details!: string;

  // ✅ Champs réels en base
  @Column({
    type: DataType.STRING,
    field: "resource_type",
  })
  resourceType!: string;

  @Column({
    type: DataType.STRING,
    field: "resource_id",
  })
  resourceId!: string;

  // ✅ Getters virtuels pour satisfaire le contrôleur (évite l'erreur 500)
  get entity(): string {
    return this.resourceType;
  }

  get entityId(): string {
    return this.resourceId;
  }

  @Column({
    type: DataType.STRING,
    field: "user_agent",
  })
  userAgent!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  @BelongsTo(() => User, { foreignKey: "userId", as: "operator" })
  operator!: User;

  @BelongsTo(() => User, { foreignKey: "userId", as: "actor" })
  actor!: User;
}