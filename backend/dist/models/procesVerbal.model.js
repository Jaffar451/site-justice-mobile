"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/procesVerbal.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const case_model_1 = __importDefault(require("./case.model"));
class ProcesVerbal extends sequelize_1.Model {
}
exports.default = ProcesVerbal;
ProcesVerbal.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
    },
    authorId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
    },
    pvType: {
        type: sequelize_1.DataTypes.ENUM("interrogation", "hearing", "seizure", "witness_statement", "crime_scene_report", "other"),
        allowNull: false,
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    redactedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "ProcesVerbaux",
    timestamps: true,
    underscored: true,
});
// Associations
ProcesVerbal.belongsTo(case_model_1.default, { foreignKey: "caseId" });
ProcesVerbal.belongsTo(user_model_1.default, { as: "author", foreignKey: "authorId" });
case_model_1.default.hasMany(ProcesVerbal, { foreignKey: "caseId" });
