'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('PoliceStations', [
      {
        name: 'Commissariat Central de Niamey',
        district: 'Niamey',
        address: 'Place de la Concertation, Plateau',
        latitude: 13.5127,
        longitude: 2.1128,
        phone: '+227 20 73 31 01',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Commissariat de District Karadjé',
        district: 'Niamey',
        address: 'Rive Droite, Quartier Karadjé',
        latitude: 13.4985,
        longitude: 2.0833,
        phone: '+227 20 35 00 00',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Commissariat Central de Maradi',
        district: 'Maradi',
        address: 'Avenue du Gouverneur, Centre-Ville',
        latitude: 13.5000,
        longitude: 7.1000,
        phone: '+227 20 41 01 02',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Commissariat Central de Zinder',
        district: 'Zinder',
        address: 'Quartier Birni',
        latitude: 13.8013,
        longitude: 8.9881,
        phone: '+227 20 51 00 55',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Commissariat de Tahoua',
        district: 'Tahoua',
        address: 'Route de Filingué',
        latitude: 14.8833,
        longitude: 5.2667,
        phone: '+227 20 61 02 03',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        name: 'Commissariat de Dosso',
        district: 'Dosso',
        address: 'Quartier Administratif',
        latitude: 13.0490,
        longitude: 3.1937,
        phone: '+227 20 65 01 01',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('PoliceStations', null, {});
  }
};