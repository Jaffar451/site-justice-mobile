"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/arrestWarrant.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
class ArrestWarrant extends sequelize_1.Model {
}
exports.default = ArrestWarrant;
ArrestWarrant.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Cases', key: 'id' },
    },
    personName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    suspectAddress: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    issuingJudgeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    issuedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    executed: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize: database_1.sequelize,
    modelName: 'ArrestWarrant',
    tableName: 'ArrestWarrants',
    timestamps: true,
    underscored: true,
});
// Relations
ArrestWarrant.belongsTo(case_model_1.default, { foreignKey: 'caseId', as: 'case' });
ArrestWarrant.belongsTo(user_model_1.default, { foreignKey: 'issuingJudgeId', as: 'judge' });
