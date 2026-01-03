"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/searchWarrant.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
class SearchWarrant extends sequelize_1.Model {
}
exports.default = SearchWarrant;
SearchWarrant.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Cases', key: 'id' },
    },
    location: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    issuedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    issuedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    executed: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize: database_1.sequelize,
    modelName: 'SearchWarrant',
    tableName: 'SearchWarrants',
    timestamps: true,
    underscored: true,
});
// Relations
SearchWarrant.belongsTo(case_model_1.default, { foreignKey: 'caseId', as: 'case' });
SearchWarrant.belongsTo(user_model_1.default, { foreignKey: 'issuedBy', as: 'judge' });
