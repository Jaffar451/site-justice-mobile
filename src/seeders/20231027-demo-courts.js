'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    
    // ✅ CORRECTION : 'courts' en minuscules pour correspondre au modèle
    return queryInterface.bulkInsert('courts', [
      {
        name: "Cour d'Appel de Niamey",
        city: "Niamey",
        type: "CA",
        jurisdiction: "Ressort de Niamey, Dosso et Tillabéri",
        status: "active",
        created_at: now, 
        updated_at: now
      },
      {
        name: "Cour d'Appel de Zinder",
        city: "Zinder",
        type: "CA",
        jurisdiction: "Ressort de Zinder et Diffa",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Cour d'Appel de Tahoua",
        city: "Tahoua",
        type: "CA",
        jurisdiction: "Ressort de Tahoua et Agadez",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Cour d'Appel de Maradi",
        city: "Maradi",
        type: "CA",
        jurisdiction: "Ressort de Maradi",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance Hors Classe de Niamey",
        city: "Niamey",
        type: "TGI",
        jurisdiction: "Communes I, II, III, IV, V de Niamey",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance de Maradi",
        city: "Maradi",
        type: "TGI",
        jurisdiction: "Département de Maradi",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance de Zinder",
        city: "Zinder",
        type: "TGI",
        jurisdiction: "Département de Zinder",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance de Tahoua",
        city: "Tahoua",
        type: "TGI",
        jurisdiction: "Département de Tahoua",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance d'Agadez",
        city: "Agadez",
        type: "TGI",
        jurisdiction: "Région d'Agadez",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance de Dosso",
        city: "Dosso",
        type: "TGI",
        jurisdiction: "Région de Dosso",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance de Tillabéri",
        city: "Tillabéri",
        type: "TGI",
        jurisdiction: "Région de Tillabéri",
        status: "active",
        created_at: now,
        updated_at: now
      },
      {
        name: "Tribunal de Grande Instance de Diffa",
        city: "Diffa",
        type: "TGI",
        jurisdiction: "Région de Diffa",
        status: "active",
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // ✅ CORRECTION : 'courts' en minuscules ici aussi
    return queryInterface.bulkDelete('courts', null, {});
  }
};