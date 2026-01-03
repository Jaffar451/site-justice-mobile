"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/appeal.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Appeal extends sequelize_1.Model {
}
exports.default = Appeal;
Appeal.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    appealDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    status: { type: sequelize_1.DataTypes.ENUM("pending", "accepted", "rejected"), defaultValue: "pending" }
}, {
    sequelize: database_1.sequelize,
    modelName: "Appeal",
    tableName: "Appeals",
    timestamps: true
});
