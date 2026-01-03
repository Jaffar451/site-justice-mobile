"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/confiscation.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Confiscation extends sequelize_1.Model {
}
exports.default = Confiscation;
Confiscation.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    item: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    reason: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    confiscatedAt: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "Confiscation",
    tableName: "Confiscations",
    timestamps: true
});
