"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/models/hearing.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
class Hearing extends sequelize_1.Model {
}
exports.default = Hearing;
Hearing.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "CASCADE",
    },
    judgeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    courtroom: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true
    },
    durationMinutes: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("scheduled", "postponed", "held", "canceled"),
        allowNull: false,
        defaultValue: "scheduled",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Hearings",
    freezeTableName: true,
    modelName: "Hearing",
    timestamps: true,
    underscored: true, // ✅ AJOUT
    indexes: [
        { fields: ["case_id"] }, // ✅ CORRECTION
        { fields: ["judge_id"] }, // ✅ CORRECTION
        { fields: ["date"] }, // ✅ AJOUT : améliore les requêtes par date
        { fields: ["status"] }, // ✅ AJOUT : améliore les filtres par statut
    ],
});
// ------------------------
// 🔗 Relations Sequelize
// ------------------------
Hearing.belongsTo(case_model_1.default, { foreignKey: "caseId", as: "case" });
case_model_1.default.hasMany(Hearing, { foreignKey: "caseId", as: "hearings" });
Hearing.belongsTo(user_model_1.default, { foreignKey: "judgeId", as: "judge" });
user_model_1.default.hasMany(Hearing, { foreignKey: "judgeId", as: "assignedHearings" });
