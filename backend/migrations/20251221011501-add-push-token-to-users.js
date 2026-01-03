'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  /**
   * Action à effectuer lors de la montée (UP)
   */
  up: async (queryInterface, Sequelize) => {
    // 1. Ajout de la colonne push_token
    await queryInterface.addColumn('Users', 'push_token', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null,
    });

    // 2. Ajout de l'index pour optimiser les performances de recherche
    await queryInterface.addIndex('Users', ['push_token']);
  },

  /**
   * Action à effectuer en cas de retour en arrière (DOWN)
   */
  down: async (queryInterface, Sequelize) => {
    // 1. Suppression de l'index d'abord
    await queryInterface.removeIndex('Users', ['push_token']);
    
    // 2. Suppression de la colonne
    await queryInterface.removeColumn('Users', 'push_token');
  }
};