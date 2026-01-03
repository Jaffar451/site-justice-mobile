"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
class Warrant extends sequelize_1.Model {
}
Warrant.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER, // ✅ Retiré UNSIGNED
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('amener', 'dépôt', 'arrestation'),
        allowNull: false,
    },
    issuedBy: {
        type: sequelize_1.DataTypes.INTEGER, // ✅ Retiré UNSIGNED
        allowNull: false,
        references: { model: user_model_1.default, key: 'id' },
    },
    issuedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW, // ✅ Ajout d'une valeur par défaut
    },
    targetName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('émis', 'exécuté', 'annulé'),
        allowNull: false,
        defaultValue: 'émis', // ✅ Ajout d'une valeur par défaut
    },
    relatedComplaintId: {
        type: sequelize_1.DataTypes.INTEGER, // ✅ Retiré UNSIGNED
        allowNull: true,
        references: { model: complaint_model_1.default, key: 'id' },
    },
}, {
    tableName: 'warrants', // ✅ Changé en minuscule (convention PostgreSQL)
    sequelize: // ✅ Changé en minuscule (convention PostgreSQL)
    database_1.sequelize,
    timestamps: true,
    underscored: true, // ✅ Ajout explicite
});
Warrant.belongsTo(user_model_1.default, { foreignKey: 'issuedBy', as: 'issuedByUser' });
Warrant.belongsTo(complaint_model_1.default, { foreignKey: 'relatedComplaintId', as: 'complaint' });
exports.default = Warrant;
