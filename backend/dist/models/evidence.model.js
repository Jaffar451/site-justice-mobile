"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/evidence.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
class Evidence extends sequelize_1.Model {
}
exports.default = Evidence;
Evidence.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "CASCADE",
    },
    uploaderId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    filename: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    fileUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    chainOfCustodyStatus: {
        type: sequelize_1.DataTypes.ENUM("sealed", "opened", "transferred", "archived"),
        allowNull: false,
        defaultValue: "sealed",
    },
    uploadedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    hash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    originOfficerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    seizureLocation: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Evidence",
    modelName: "Evidence",
    freezeTableName: true,
    timestamps: true,
    underscored: true, // ✅ AJOUT
    indexes: [
        { fields: ["case_id"] }, // ✅ CORRECTION
        { fields: ["uploader_id"] }, // ✅ AJOUT
        { fields: ["origin_officer_id"] }, // ✅ AJOUT
        { unique: true, fields: ["hash"] },
    ],
});
// 🔗 Relations
Evidence.belongsTo(case_model_1.default, { foreignKey: "caseId", as: "case" });
case_model_1.default.hasMany(Evidence, { foreignKey: "caseId", as: "evidence" });
Evidence.belongsTo(user_model_1.default, { foreignKey: "uploaderId", as: "uploadedBy" });
user_model_1.default.hasMany(Evidence, { foreignKey: "uploaderId", as: "uploadedEvidence" });
Evidence.belongsTo(user_model_1.default, { foreignKey: "originOfficerId", as: "originOfficer" });
user_model_1.default.hasMany(Evidence, { foreignKey: "originOfficerId", as: "evidenceOrigin" });
