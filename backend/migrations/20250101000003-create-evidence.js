"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Evidence", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      caseId: Sequelize.INTEGER,
      filename: Sequelize.STRING,
      filetype: Sequelize.STRING,
      path: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Evidence");
  }
};
