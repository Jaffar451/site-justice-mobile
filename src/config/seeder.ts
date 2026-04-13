// PATH: config/seeder.ts
import bcrypt from "bcryptjs";
import { sequelize } from "./database";
import {
  User,
  PoliceStation,
  Court,
  Prison,
  Complaint,
  AuditLog,
} from "../models";

const seedDatabase = async () => {
  try {
    console.log("🔄 Connexion à la base de données...");
    await sequelize.authenticate();

    // Nettoyage complet
    await sequelize.sync({ force: true });

    console.log("🌱 Base de données nettoyée. Démarrage du peuplement...");

    const passwordHash = await bcrypt.hash("Password123", 10);

    // ==========================================
    // 1. INFRASTRUCTURES
    // ==========================================

    const central = await PoliceStation.create({
      name: "Commissariat Central de Niamey",
      city: "Niamey",
      type: "POLICE",
      district: "Plateau",
      address: "Boulevard de la République",
      phone: "+227 20 73 25 15",
    } as any);

    const tgi = await Court.create({
      name: "TGI Hors Classe de Niamey",
      city: "Niamey",
      type: "TGI",
      jurisdiction: "Niamey",
      status: "active",
    } as any);

    const prison = await Prison.create({
      name: "Maison d'Arrêt de Niamey",
      city: "Niamey",
      type: "Maison d'Arrêt",
      capacity: 500,
      status: "active",
    } as any);

    console.log("✅ Infrastructures créées.");

    // ==========================================
    // 2. ACTEURS (UTILISATEURS)
    // ==========================================

    // 👤 ADMIN
    const admin = await User.create({
      firstname: "Moussa",
      lastname: "Administrateur",
      email: "admin@justice.ne",
      password: passwordHash,
      role: "admin",
      organization: "ADMIN",
      matricule: "ADM-001",
      isActive: true,
      status: "active",
    } as any);

    // 👮 POLICE - OPJ
    const opj = await User.create({
      firstname: "Ibrahim",
      lastname: "Agent",
      email: "opj@police.ne",
      password: passwordHash,
      role: "police",
      organization: "POLICE",
      policeStationId: central.id,
      matricule: "POL-2024-001",
      isActive: true,
      status: "active",
    } as any);

    // 👮‍♂️ POLICE - COMMISSAIRE
    const commissaire = await User.create({
      firstname: "Abdoulaye",
      lastname: "Commissaire",
      email: "commissaire@police.ne",
      password: passwordHash,
      role: "commisaire",
      organization: "POLICE",
      policeStationId: central.id,
      matricule: "POL-BOSS-001",
      isActive: true,
      status: "active",
    } as any);

    // ⚖️ JUSTICE - PROCUREUR
    const procureur = await User.create({
      firstname: "Fatouma",
      lastname: "Procureur",
      email: "procureur@justice.ne",
      password: passwordHash,
      role: "prosecutor",
      organization: "JUSTICE",
      courtId: tgi.id,
      matricule: "MAG-001",
      isActive: true,
      status: "active",
    } as any);

    // ⚖️ JUSTICE - JUGE
    const juge = await User.create({
      firstname: "Sani",
      lastname: "Juge",
      email: "juge@justice.ne",
      password: passwordHash,
      role: "judge",
      organization: "JUSTICE",
      courtId: tgi.id,
      matricule: "MAG-002",
      isActive: true,
      status: "active",
    } as any);

    // 🙎‍♂️ CITOYEN
    const citizen = await User.create({
      firstname: "Amadou",
      lastname: "Kouka",
      email: "citoyen@gmail.com",
      password: passwordHash,
      role: "citizen",
      organization: "CITIZEN",
      isActive: true,
      status: "active",
      telephone: "+227 90 90 90 90",
    } as any);

    console.log("✅ Utilisateurs créés.");

    // ==========================================
    // 3. DONNÉES DE DÉMO
    // ==========================================

    await Complaint.create({
      citizenId: citizen.id,
      policeStationId: central.id,
      title: "Vol de moto",
      description:
        "Ma moto Kasea a été volée au grand marché hier soir vers 18h.",
      category: "Vol",
      status: "soumise",
      filedAt: new Date(),
      trackingCode: "PL-2024-DEMO-01",
      validatedByCommissaire: false,
    } as any);

    console.log("✅ Plainte de démonstration créée.");

    // ==========================================
    // 4. AUDIT
    // ==========================================

    await AuditLog.create({
      userId: admin.id,
      action: "INITIALISATION_DEMO",
      severity: "INFO",
      // ✅ CORRECTION : 'SYSTEM' n'existe pas dans l'ENUM (GET, POST, PUT, DELETE, PATCH)
      // On utilise 'POST' car c'est une création de données.
      method: "POST",
      endpoint: "SEEDER",
      ip: "127.0.0.1",
      status: "SUCCESS",
      details: "Peuplement initial de la base de données.",
      timestamp: new Date(),
      hash: "init-hash-123456",
    } as any);

    console.log("🎉 Seeding terminé avec succès !");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur Critique Seeding :", error);
    process.exit(1);
  }
};

seedDatabase();
