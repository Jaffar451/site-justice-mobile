"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/witness.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Witness extends sequelize_1.Model {
}
exports.default = Witness;
Witness.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    hearingId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    fullName: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    statement: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "Witness",
    tableName: "Witnesses",
    timestamps: true
});
