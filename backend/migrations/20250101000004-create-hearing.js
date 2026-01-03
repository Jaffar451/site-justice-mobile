"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Hearings", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      caseId: Sequelize.INTEGER,
      date: Sequelize.DATE,
      status: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Hearings");
  }
};
