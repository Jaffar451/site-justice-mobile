"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/assignment.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const case_model_1 = __importDefault(require("./case.model"));
class Assignment extends sequelize_1.Model {
}
exports.default = Assignment;
Assignment.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "CASCADE",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
    },
    role: {
        type: sequelize_1.DataTypes.ENUM("police_investigator", "prosecutor", "judge_instruction", "judge_trial", "greffier", "lawyer"),
        allowNull: false,
    },
    assignedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    endedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Assignments",
    timestamps: true,
    underscored: true,
});
// Relations
Assignment.belongsTo(user_model_1.default, { foreignKey: "userId" });
Assignment.belongsTo(case_model_1.default, { foreignKey: "caseId" });
