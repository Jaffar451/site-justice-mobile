"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Détention Préventive - detention.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Detention extends sequelize_1.Model {
}
exports.default = Detention;
Detention.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    suspectId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    decisionId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    dateDebut: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    dateFin: { type: sequelize_1.DataTypes.DATE, allowNull: false },
    motif: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    lieuDetention: { type: sequelize_1.DataTypes.STRING, allowNull: false },
}, { sequelize: database_1.sequelize, tableName: "Detentions" });
// Mandat - warrant.model.ts
// Garde à Vue - custody.model.ts
