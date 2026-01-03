"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/prosecution.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Prosecution extends sequelize_1.Model {
}
exports.default = Prosecution;
Prosecution.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    complaintId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    prosecutorId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    date: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    description: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "Prosecution",
    tableName: "Prosecutions",
    timestamps: true
});
