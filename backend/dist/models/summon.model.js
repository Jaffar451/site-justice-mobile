"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/summon.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
class Summon extends sequelize_1.Model {
}
exports.default = Summon;
Summon.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaintId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Complaints", key: "id" },
        onDelete: "CASCADE",
    },
    issuedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    targetName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    targetPhone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    scheduledAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("envoyée", "reçue", "non_remise", "ignorée", "reportée", "effectuée"),
        allowNull: false,
        defaultValue: "envoyée",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Summons",
    modelName: "Summon",
    timestamps: true,
    underscored: true,
});
// Relations
Summon.belongsTo(complaint_model_1.default, { foreignKey: "complaintId", as: "complaint" });
complaint_model_1.default.hasMany(Summon, { foreignKey: "complaintId" });
Summon.belongsTo(user_model_1.default, { foreignKey: "issuedBy", as: "officer" });
user_model_1.default.hasMany(Summon, { foreignKey: "issuedBy" });
