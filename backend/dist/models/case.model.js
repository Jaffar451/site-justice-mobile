"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/case.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CaseModel extends sequelize_1.Model {
}
exports.default = CaseModel;
CaseModel.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaintId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 🔥 une plainte ne génère qu’un seul dossier
        references: { model: "Complaints", key: "id" },
        onDelete: "CASCADE",
    },
    reference: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("criminal", "civil", "other"),
        allowNull: false,
        defaultValue: "criminal",
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("open", "closed", "archived"),
        allowNull: false,
        defaultValue: "open",
    },
    stage: {
        type: sequelize_1.DataTypes.ENUM("police_investigation", "prosecution_review", "trial", "appeal", "execution", "archived"),
        allowNull: false,
        defaultValue: "police_investigation",
    },
    openedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    closedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Cases",
    modelName: "Case",
    timestamps: true,
    underscored: true,
});
