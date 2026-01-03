"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Decisions", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      caseId: Sequelize.INTEGER,
      verdict: Sequelize.TEXT,
      sentencedAt: Sequelize.DATE,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Decisions");
  }
};
