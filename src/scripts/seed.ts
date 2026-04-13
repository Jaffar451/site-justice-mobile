// PATH: src/scripts/seed.ts

// 1. On garde l'import de sequelize pour la connexion et sync
import { sequelize } from "../models";

// 2. ⚠️ CORRECTION : On importe les Modèles et l'Enum directement depuis leurs fichiers
// Cela évite l'erreur "Module has no exported member"
import User, { UserRole } from "../models/user.model";
import PoliceStation from "../models/policeStation.model";
import Court from "../models/court.model";
import Prison from "../models/prison.model";

// 3. Librairie de hachage
import bcrypt from "bcryptjs"; // Si erreur, remplacez par 'bcrypt'

async function seed() {
  try {
    console.log("🌱 Démarrage du Seeding...");

    // Connexion DB
    await sequelize.authenticate();
    await sequelize.sync({ force: true });

    // Hachage du mot de passe
    const passwordHash = await bcrypt.hash("password123", 10);

    // --- A. CRÉATION DES STRUCTURES ---
    console.log("🏢 Création des structures...");

    const [tribunal] = await Court.findOrCreate({
      where: { name: "Tribunal de Grande Instance de Niamey" },
      defaults: {
        city: "Niamey",
        jurisdiction: "Région de Niamey",
        type: "TGI",
        status: "active",
      },
    });

    const [commissariat] = await PoliceStation.findOrCreate({
      where: { name: "Commissariat Central de Niamey" },
      defaults: {
        type: "POLICE",
        city: "Niamey",
        district: "Centre-Ville",
        status: "active",
      },
    });

    const [prison] = await Prison.findOrCreate({
      where: { name: "Maison d'Arrêt de Niamey" },
      defaults: {
        city: "Niamey",
        type: "Maison d'Arrêt",
        capacity: 1200,
        status: "active",
      },
    });

    // --- B. CRÉATION DES UTILISATEURS ---
    console.log("👤 Création des utilisateurs...");

    // Nettoyage préalable
    await User.destroy({ where: {} });

    // 1. Super Admin
    await User.create({
      firstname: "Super",
      lastname: "Admin",
      email: "admin@justice.ne",
      matricule: "ADM-001",
      password: passwordHash,
      role: UserRole.ADMIN, // ✅ L'erreur a disparu ici
      telephone: "90000000",
    });

    // 2. Procureur
    await User.create({
      firstname: "Amadou",
      lastname: "Procureur",
      email: "procureur@justice.ne",
      matricule: "JUS-001",
      password: passwordHash,
      role: UserRole.PROSECUTOR,
      courtId: tribunal.id,
      telephone: "91000000",
    });

    // 3. Commissaire
    await User.create({
      firstname: "Ibrahim",
      lastname: "Commissaire",
      email: "police@justice.ne",
      matricule: "POL-001",
      password: passwordHash,
      role: UserRole.COMMISSAIRE,
      policeStationId: commissariat.id,
      telephone: "93000000",
    });

    console.log("✅ Seeding terminé avec succès !");
    console.log("👉 Login Admin : admin@justice.ne");
    console.log("👉 Login Police: police@justice.ne");
    console.log("👉 Mot de passe: password123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur lors du seeding :", error);
    process.exit(1);
  }
}

seed();
