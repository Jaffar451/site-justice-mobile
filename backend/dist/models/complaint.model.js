"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/complaint.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const case_model_1 = __importDefault(require("./case.model"));
class Complaint extends sequelize_1.Model {
}
exports.default = Complaint;
Complaint.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    citizenId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "CASCADE",
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("soumise", "en_cours_OPJ", "transmise_procur", "classée_sans_suite_par_OPJ", "classée_sans_suite_par_procureur", "poursuite", "instruction", "audience_programmée", "jugée", "non_lieu"),
        allowNull: false,
        defaultValue: "soumise",
    },
    filedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
    location: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    provisionalOffence: { type: sequelize_1.DataTypes.STRING, allowNull: true },
}, {
    sequelize: database_1.sequelize,
    tableName: "Complaints",
    modelName: "Complaint",
    timestamps: true,
    underscored: true,
});
// 🔗 Relations
Complaint.belongsTo(user_model_1.default, { foreignKey: "citizenId", as: "citizen" });
user_model_1.default.hasMany(Complaint, { foreignKey: "citizenId" });
Complaint.hasOne(case_model_1.default, { foreignKey: "complaintId", as: "case" });
case_model_1.default.belongsTo(Complaint, { foreignKey: "complaintId" });
