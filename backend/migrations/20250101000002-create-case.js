"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cases", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      complaintId: Sequelize.INTEGER,
      reference: Sequelize.STRING,
      type: Sequelize.STRING,
      status: Sequelize.STRING,
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Cases");
  }
};
