"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/models/note.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const case_model_1 = __importDefault(require("./case.model"));
class Note extends sequelize_1.Model {
}
exports.default = Note;
Note.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    caseId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Cases", key: "id" },
        onDelete: "CASCADE",
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "id" },
        onDelete: "SET NULL",
    },
    content: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    visibility: {
        type: sequelize_1.DataTypes.ENUM("internal_prosecution", "internal_court", "case_global"),
        allowNull: false,
        defaultValue: "case_global",
    },
    encrypted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    hash: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "",
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Notes",
    freezeTableName: true,
    timestamps: false,
    underscored: true,
    indexes: [
        { fields: ["case_id"] },
        { fields: ["user_id"] },
        { fields: ["visibility"] },
    ],
});
// 🔗 Relations
Note.belongsTo(user_model_1.default, { foreignKey: "userId", as: "author" });
Note.belongsTo(case_model_1.default, { foreignKey: "caseId", as: "relatedCase" });
