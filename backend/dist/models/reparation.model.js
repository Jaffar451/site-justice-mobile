"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/reparation.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Reparation extends sequelize_1.Model {
}
exports.default = Reparation;
Reparation.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    beneficiary: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    amount: { type: sequelize_1.DataTypes.FLOAT, allowNull: false },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "Reparation",
    tableName: "Reparations",
    timestamps: true
});
