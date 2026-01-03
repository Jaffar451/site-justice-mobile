'use strict';

module.exports = {
  up: async (queryInterface) => {
    const now = new Date();
    
    return queryInterface.bulkInsert('police_stations', [
      {
        name: "Commissariat Central de Niamey",
        district: "Niamey",
        address: "Avenue de la Présidence",
        phone: "+227 20 73 31 01",
        latitude: 13.5127,
        longitude: 2.1126,
        created_at: now,
        updated_at: now
      },
      {
        name: "Commissariat de Filingué",
        district: "Tillabéri",
        address: "Quartier Administratif",
        phone: "+227 20 73 31 02",
        latitude: 14.3521,
        longitude: 3.3184,
        created_at: now,
        updated_at: now
      },
      {
        name: "Brigade de Gendarmerie d'Agadez",
        district: "Agadez",
        address: "Entrée Ville - Route Tahoua",
        phone: "+227 20 44 01 12",
        latitude: 16.9733,
        longitude: 7.9911,
        created_at: now,
        updated_at: now
      },
      {
        name: "Commissariat de Dosso",
        district: "Dosso",
        address: "Quartier Grand Marché",
        phone: "+227 20 65 02 10",
        latitude: 13.0440,
        longitude: 3.1947,
        created_at: now,
        updated_at: now
      }
    ], {});
  },

  down: async (queryInterface) => {
    return queryInterface.bulkDelete('police_stations', null, {});
  }
};