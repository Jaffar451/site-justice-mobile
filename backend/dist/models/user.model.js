"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const database_1 = require("../config/database");
class User extends sequelize_1.Model {
}
exports.default = User;
User.init({
    id: { type: sequelize_1.DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    firstname: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    lastname: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    email: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
        set(val) {
            this.setDataValue("email", val.toLowerCase());
        },
    },
    password: { type: sequelize_1.DataTypes.STRING, allowNull: false },
    role: {
        type: sequelize_1.DataTypes.ENUM("citizen", "police", "prosecutor", "judge", "clerk", "lawyer", "prison_officer", "admin"),
        allowNull: false,
        defaultValue: "citizen",
    },
    // ✅ Champ 'telephone' configuré (remplace 'phone')
    telephone: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    matricule: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        unique: true,
        validate: {
            notNullIfnotCitizen(value) {
                if (this.role !== "citizen" &&
                    (value === null || value.trim() === "")) {
                    throw new Error("Matricule is required for non-citizen roles.");
                }
            },
        },
    },
    poste: { type: sequelize_1.DataTypes.STRING, allowNull: true },
    status: {
        type: sequelize_1.DataTypes.ENUM("active", "suspended", "archived"),
        allowNull: false,
        defaultValue: "active",
    },
    failedAttempts: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lockUntil: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    sequelize: database_1.sequelize,
    tableName: "Users",
    freezeTableName: true,
    modelName: "User",
    timestamps: true,
    underscored: true,
    indexes: [
        { fields: ["role"] },
        { unique: true, fields: ["email"] },
    ],
});
