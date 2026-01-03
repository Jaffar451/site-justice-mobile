"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/custodyExtension.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class CustodyExtension extends sequelize_1.Model {
}
exports.default = CustodyExtension;
CustodyExtension.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    suspectId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    requestedBy: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    newEndDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "CustodyExtension",
    tableName: "CustodyExtensions",
    timestamps: true
});
