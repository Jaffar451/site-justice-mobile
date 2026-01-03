"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
class Custody extends sequelize_1.Model {
}
Custody.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    suspectName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    suspectPhone: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    startedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    reason: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    location: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    orderedBy: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: { model: user_model_1.default, key: 'id' },
    },
    relatedComplaintId: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        references: { model: complaint_model_1.default, key: 'id' },
    },
}, {
    tableName: 'Custodies',
    sequelize: database_1.sequelize,
});
Custody.belongsTo(user_model_1.default, { foreignKey: 'orderedBy', as: 'orderedByUser' });
Custody.belongsTo(complaint_model_1.default, { foreignKey: 'relatedComplaintId', as: 'complaint' });
exports.default = Custody;
