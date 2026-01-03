"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/sentence.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class Sentence extends sequelize_1.Model {
}
exports.default = Sentence;
Sentence.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    judgeId: { type: sequelize_1.DataTypes.INTEGER, allowNull: false },
    sentenceText: { type: sequelize_1.DataTypes.TEXT, allowNull: false },
    sentenceDate: { type: sequelize_1.DataTypes.DATE, allowNull: false },
}, {
    sequelize: database_1.sequelize,
    modelName: "Sentence",
    tableName: "Sentences",
    timestamps: true
});
