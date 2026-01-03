"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/models/attachment.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
class Attachment extends sequelize_1.Model {
}
exports.default = Attachment;
Attachment.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "CASCADE",
    },
    filename: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    fileUrl: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    uploadedBy: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Attachments",
    timestamps: true,
    underscored: true,
});
// Relations
Attachment.belongsTo(case_model_1.default, { foreignKey: "caseId" });
Attachment.belongsTo(user_model_1.default, { foreignKey: "uploadedBy" });
