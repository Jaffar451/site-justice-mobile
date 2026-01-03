// createAdmin.ts
import User from './src/models/user.model'; 
import bcrypt from 'bcryptjs';
import { sequelize } from './src/config/database'; // Assure-toi d'importer sequelize pour fermer la connexion à la fin

const createAdmin = async () => {
  try {
    console.log("⏳ Connexion et mise à jour de la table Users...");
    
    // ⚠️ IMPORTANT : Ceci met à jour la structure de la table si tu as changé des colonnes
    await User.sync({ alter: true }); 

    // 1. Vérifier si l'admin existe
    const existingAdmin = await User.findOne({ 
        where: { email: 'admin@justice.ne' } 
    });

    if (existingAdmin) {
      console.log("⚠️ L'admin existe déjà !");
      return;
    }

    // 2. Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // 3. Créer l'utilisateur (Avec les nouveaux champs anglais)
    const newAdmin = await User.create({
      email: 'admin@justice.ne',
      password: hashedPassword,
      firstname: 'Systeme',        // ✅ Correspond à ton modèle
      lastname: 'Administrateur',  // ✅ Correspond à ton modèle
      role: 'admin',
      telephone: '90000000',       // ✅ Correspond à ton modèle
      matricule: 'ADMIN-001',      // ✅ OBLIGATOIRE pour un admin selon ton validateur !
      status: 'active',
      failedAttempts: 0
    });

    console.log("✅ Super Utilisateur créé avec succès ! ID:", newAdmin.getDataValue('id'));

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    // On ferme la connexion proprement
    await sequelize.close(); 
  }
};

createAdmin();