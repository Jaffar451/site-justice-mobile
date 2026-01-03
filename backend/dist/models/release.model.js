"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/release.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Release extends sequelize_1.Model {
}
exports.default = Release;
Release.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    suspectId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    reason: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    releaseDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "Release",
    tableName: "Releases",
    timestamps: true
});
