"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/models/refresh-token.model.ts
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
const user_model_1 = __importDefault(require("./user.model"));
class RefreshToken extends sequelize_1.Model {
}
exports.default = RefreshToken;
RefreshToken.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    token: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "RefreshTokens",
    modelName: "RefreshToken",
    timestamps: true,
    underscored: true,
});
// 🔗 Association
RefreshToken.belongsTo(user_model_1.default, { foreignKey: "userId", as: "user" });
user_model_1.default.hasMany(RefreshToken, { foreignKey: "userId", as: "refreshTokens" });
