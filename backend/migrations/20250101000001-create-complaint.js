"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Complaints", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      citizenId: Sequelize.INTEGER,
      description: Sequelize.TEXT,
      status: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Complaints");
  }
};
