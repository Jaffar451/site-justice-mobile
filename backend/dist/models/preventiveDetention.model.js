"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/preventiveDetention.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const complaint_model_1 = __importDefault(require("./complaint.model"));
const user_model_1 = __importDefault(require("./user.model"));
class PreventiveDetention extends sequelize_1.Model {
}
exports.default = PreventiveDetention;
// Init
PreventiveDetention.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    suspectName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    startedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    endedAt: { type: sequelize_1.DataTypes.DATE, allowNull: true },
    location: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    orderedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    complaintId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'Complaints', key: 'id' },
    },
}, {
    sequelize: database_1.sequelize,
    modelName: 'PreventiveDetention',
    tableName: 'PreventiveDetentions',
    timestamps: true,
    underscored: true,
});
// Relations
PreventiveDetention.belongsTo(user_model_1.default, { foreignKey: 'orderedBy', as: 'judge' });
PreventiveDetention.belongsTo(complaint_model_1.default, { foreignKey: 'complaintId', as: 'complaint' });
