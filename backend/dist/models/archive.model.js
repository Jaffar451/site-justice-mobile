"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/archive.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const case_model_1 = __importDefault(require("./case.model"));
class Archive extends sequelize_1.Model {
}
exports.default = Archive;
Archive.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "RESTRICT", // Prevent deleting a case that is archived
    },
    archivedByUserId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
    },
    caseData: {
        type: sequelize_1.DataTypes.JSONB, // Use JSONB for efficient querying in PostgreSQL
        allowNull: false,
        comment: "Snapshot of case data at the time of archiving."
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    archivedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Archives",
    timestamps: true,
    underscored: true,
});
// Associations
Archive.belongsTo(case_model_1.default, { foreignKey: "caseId" });
Archive.belongsTo(user_model_1.default, { as: "archiver", foreignKey: "archivedByUserId" });
