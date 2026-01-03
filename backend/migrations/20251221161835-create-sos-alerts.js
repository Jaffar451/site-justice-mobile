'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('SosAlerts', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER // L'ID de l'alerte reste un chiffre
      },
      user_id: {
        type: Sequelize.UUID, // 👈 CHANGÉ : Doit correspondre au type de Users.id
        allowNull: false,
        references: { model: 'Users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      police_station_id: {
        type: Sequelize.INTEGER, // Reste INTEGER car PoliceStations.id est un chiffre
        allowNull: false,
        references: { model: 'PoliceStations', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      latitude: { type: Sequelize.FLOAT, allowNull: false },
      longitude: { type: Sequelize.FLOAT, allowNull: false },
      status: {
        type: Sequelize.ENUM('pending', 'dispatched', 'resolved'),
        defaultValue: 'pending'
      },
      created_at: { allowNull: false, type: Sequelize.DATE },
      updated_at: { allowNull: false, type: Sequelize.DATE }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('SosAlerts');
  }
};