"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/decision.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
class Decision extends sequelize_1.Model {
}
exports.default = Decision;
Decision.init({
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
    judgeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    type: {
        type: sequelize_1.DataTypes.ENUM("judgment_first_instance", "judgment_appeal", "order_instruction", "order_provisional", "other"),
        allowNull: false,
        defaultValue: "judgment_first_instance",
    },
    verdict: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false
    },
    legalBasis: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    sentenceYears: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    sentenceMonths: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true
    },
    fineAmount: {
        type: sequelize_1.DataTypes.DECIMAL(15, 2),
        allowNull: true
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    decisionNumber: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    signedBy: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Decisions",
    modelName: "Decision",
    timestamps: true,
    underscored: true, // ✅ AJOUT : Active snake_case
    indexes: [
        { fields: ["case_id"] }, // ✅ CORRECTION : snake_case
        { fields: ["judge_id"] }, // ✅ CORRECTION : snake_case
        { unique: true, fields: ["decision_number"] }, // ✅ CORRECTION : snake_case
    ],
});
// 🔗 Relations
Decision.belongsTo(case_model_1.default, { foreignKey: "caseId", as: "case" });
case_model_1.default.hasMany(Decision, { foreignKey: "caseId", as: "decisions" });
Decision.belongsTo(user_model_1.default, { foreignKey: "judgeId", as: "judge" });
user_model_1.default.hasMany(Decision, { foreignKey: "judgeId", as: "judgeDecisions" });
