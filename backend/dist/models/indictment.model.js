"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/indictment.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const complaint_model_1 = __importDefault(require("./complaint.model"));
const user_model_1 = __importDefault(require("./user.model"));
class Indictment extends sequelize_1.Model {
}
exports.default = Indictment;
Indictment.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    complaintId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Complaints", key: "id" },
        onDelete: "CASCADE",
    },
    judgeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    charges: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    observations: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Indictments",
    modelName: "Indictment",
    timestamps: true,
    underscored: true,
});
// Associations
Indictment.belongsTo(complaint_model_1.default, { foreignKey: "complaintId", as: "complaint" });
complaint_model_1.default.hasOne(Indictment, { foreignKey: "complaintId", as: "indictment" });
Indictment.belongsTo(user_model_1.default, { foreignKey: "judgeId", as: "judge" });
user_model_1.default.hasMany(Indictment, { foreignKey: "judgeId", as: "indictments" });
