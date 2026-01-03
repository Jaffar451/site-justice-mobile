"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/models/log.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
class Log extends sequelize_1.Model {
}
exports.default = Log;
Log.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    action: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    method: {
        type: sequelize_1.DataTypes.ENUM("GET", "POST", "PUT", "DELETE", "PATCH"),
        allowNull: false,
    },
    endpoint: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    ip: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false
    },
    timestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    hash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Logs",
    freezeTableName: true,
    timestamps: false,
    underscored: true, // ✅ AJOUT
    indexes: [
        { fields: ["user_id"] }, // ✅ CORRECTION
        { fields: ["timestamp"] }, // ✅ Déjà correct
        { fields: ["endpoint"] }, // ✅ Déjà correct
        { fields: ["method"] }, // ✅ AJOUT : pour filtrer par méthode HTTP
    ],
});
// 🔗 Relations
Log.belongsTo(user_model_1.default, { foreignKey: "userId", as: "actor" });
user_model_1.default.hasMany(Log, { foreignKey: "userId", as: "logs" });
