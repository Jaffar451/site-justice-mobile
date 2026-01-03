import { Table, Column, Model, DataType, HasMany, HasOne, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import PoliceStation from './policeStation.model';
import Court from './court.model';
import Prison from './prison.model';
import RefreshToken from './refreshToken.model';
import AuditLog from './auditLog.model';
import Complaint from './complaint.model';
import Detainee from './detainee.model';
import SosAlert from './sosAlert.model';

// ✅ DÉFINITION DES RÔLES
export enum UserRole {
  // --- Administration ---
  ADMIN = 'admin',

  // --- Justice (Magistrats & Greffe) ---
  PROSECUTOR = 'prosecutor', // Procureur
  JUDGE = 'judge',           // Juge d'Instruction / Siège
  CLERK = 'greffier',        // Greffier

  // --- Forces de l'Ordre (OPJ & Agents) ---
  COMMISSAIRE = 'commissaire',      // Commissaire de Police (Chef d'unité)
  OFFICIER_POLICE = 'officier_police', // Officier de Police
  INSPECTEUR = 'inspecteur',        // Inspecteur de Police
  
  OPJ_GENDARME = 'opj_gendarme',    // Officier de Police Judiciaire (Gendarmerie)
  GENDARME = 'gendarme',            // Gendarme (APJ)
  
  // --- Pénitentiaire ---
  PRISON_GUARD = 'prison_guard',    // Garde Pénitentiaire
  PRISON_DIRECTOR = 'prison_director', // Régisseur de prison

  // --- Public ---
  CITIZEN = 'citizen',       // Citoyen / Plaignant
  LAWYER = 'lawyer'          // Avocat
}

@Table({ tableName: 'users', timestamps: true, underscored: true })
export default class User extends Model {
  
  @Column({ type: DataType.STRING, allowNull: false })
  firstname!: string;

  @Column({ type: DataType.STRING, allowNull: false })
  lastname!: string;

  @Column({ type: DataType.STRING, allowNull: false, unique: true })
  email!: string;

  // ✅ AJOUT DE LA COLONNE MANQUANTE "MATRICULE"
  // Permet la connexion via matricule pour les policiers/magistrats
  @Column({ 
    type: DataType.STRING, 
    allowNull: true, // Optionnel (les citoyens n'en ont pas)
    unique: true     // S'il existe, il doit être unique
  })
  matricule?: string;

  @Column({ type: DataType.STRING, allowNull: false })
  password!: string;

  @Column({ type: DataType.STRING, allowNull: true })
  telephone?: string;

  @Column({ 
    type: DataType.ENUM(...Object.values(UserRole)), 
    defaultValue: UserRole.CITIZEN 
  })
  role!: UserRole;

  @Column({ type: DataType.STRING, allowNull: true })
  organization?: string; // Ex: "Commissariat Central", "Brigade Fluviale"

  @Column({ type: DataType.STRING, allowNull: true })
  district?: string; // Ex: "Niamey", "Agadez"

  // --- RELATIONS ---

  // 1. Liaison Commissariat (Police)
  @ForeignKey(() => PoliceStation)
  @Column({ type: DataType.INTEGER, allowNull: true })
  policeStationId?: number;

  @BelongsTo(() => PoliceStation, { as: 'station' })
  station?: PoliceStation;

  // 2. Liaison Tribunal (Justice)
  @ForeignKey(() => Court)
  @Column({ type: DataType.INTEGER, allowNull: true })
  courtId?: number;

  @BelongsTo(() => Court, { as: 'court' })
  court?: Court;

  // 3. Liaison Prison (Pénitentiaire)
  @ForeignKey(() => Prison)
  @Column({ type: DataType.INTEGER, allowNull: true })
  prisonId?: number;

  @BelongsTo(() => Prison, { as: 'prison' })
  prison?: Prison;

  // --- AUTRES RELATIONS ---

  @HasMany(() => AuditLog, { as: 'auditLogs' })
  auditLogs!: AuditLog[];

  @HasOne(() => RefreshToken, { as: 'authSession' })
  authSession?: RefreshToken;

  @HasMany(() => Complaint, { as: 'filedComplaints' })
  filedComplaints!: Complaint[];

  @HasMany(() => SosAlert, { as: 'sentAlerts' })
  sentAlerts!: SosAlert[];

  @HasOne(() => Detainee, { as: 'detaineeProfile' })
  detaineeProfile?: Detainee;

  @CreatedAt createdAt!: Date;
  @UpdatedAt updatedAt!: Date;
}