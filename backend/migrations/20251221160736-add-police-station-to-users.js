'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'police_station_id', {
      type: Sequelize.INTEGER,
      allowNull: true, // "true" car les citoyens n'ont pas de commissariat
      references: {
        model: 'PoliceStations', // Nom exact de la table créée à l'étape précédente
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // Si on supprime un commissariat, le policier n'est pas supprimé, il devient "non-affecté"
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'police_station_id');
  }
};