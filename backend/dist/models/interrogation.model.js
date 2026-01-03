"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/interrogation.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
class Interrogation extends sequelize_1.Model {
}
exports.default = Interrogation;
Interrogation.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaintId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Complaints', key: 'id' },
        onDelete: 'CASCADE',
    },
    officerId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'Users', key: 'id' },
    },
    suspectName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    date: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    summary: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    signed: { type: sequelize_1.DataTypes.BOOLEAN, defaultValue: false },
}, {
    sequelize: database_1.sequelize,
    modelName: 'Interrogation',
    tableName: 'Interrogations',
    timestamps: true,
    underscored: true,
});
// Relations
Interrogation.belongsTo(user_model_1.default, { foreignKey: 'officerId', as: 'officer' });
Interrogation.belongsTo(complaint_model_1.default, { foreignKey: 'complaintId', as: 'complaint' });
