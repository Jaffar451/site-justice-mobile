import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import User from './user.model';

@Table({
  tableName: 'audit_logs',
  underscored: true,
  timestamps: true, // Gère automatiquement createdAt et updatedAt
})
export default class AuditLog extends Model {
  @Column({ 
    type: DataType.INTEGER, 
    primaryKey: true, 
    autoIncrement: true 
  })
  id!: number;

  @ForeignKey(() => User)
  @Column({ 
    type: DataType.INTEGER, 
    field: 'user_id',
    allowNull: true // Permet de loguer des actions système sans utilisateur
  })
  userId!: number;

  @Column(DataType.STRING)
  action!: string;

  @Column(DataType.STRING)
  method!: string;

  @Column(DataType.STRING)
  endpoint!: string;

  // ✅ Mapping explicite vers la colonne ip_address de PostgreSQL
  @Column({ 
    type: DataType.STRING, 
    field: 'ip_address' 
  })
  ipAddress!: string;

  // ✅ Getter Virtuel pour compatibilité Frontend (item.ip)
  get ip(): string {
    return this.ipAddress;
  }

  @Column({
    type: DataType.ENUM('info', 'warning', 'critical'),
    defaultValue: 'info'
  })
  severity!: 'info' | 'warning' | 'critical';

  @Column({ 
    type: DataType.STRING, 
    defaultValue: 'SUCCESS' 
  })
  status!: string;

  @Column(DataType.TEXT)
  details!: string;

  @Column({
    type: DataType.STRING,
    field: 'resource_type'
  })
  resourceType!: string;

  @Column({
    type: DataType.STRING,
    field: 'resource_id'
  })
  resourceId!: string;

  @Column({
    type: DataType.STRING,
    field: 'user_agent'
  })
  userAgent!: string;

  @CreatedAt
  createdAt!: Date;

  @UpdatedAt
  updatedAt!: Date;

  // ✅ 1. Alias 'operator' (Existant - Ne pas supprimer)
  @BelongsTo(() => User, { foreignKey: 'userId', as: 'operator' })
  operator!: User;

  // ✅ 2. Alias 'actor' (Ajouté pour compatibilité avec le Contrôleur Admin)
  // Cela permet d'utiliser include: [{ model: User, as: 'actor' }]
  @BelongsTo(() => User, { foreignKey: 'userId', as: 'actor' })
  actor!: User;
}