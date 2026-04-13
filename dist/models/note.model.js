"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const case_model_1 = __importDefault(require("./case.model"));
const user_model_1 = __importDefault(require("./user.model"));
const encryption_util_1 = require("../utils/encryption.util");
const crypto_1 = __importDefault(require("crypto"));
let Note = class Note extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => case_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Note.prototype, "caseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => case_model_1.default, { as: 'relatedCase' }),
    __metadata("design:type", case_model_1.default)
], Note.prototype, "relatedCase", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Note.prototype, "userId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, { as: 'author' }),
    __metadata("design:type", user_model_1.default)
], Note.prototype, "author", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.TEXT,
        allowNull: false,
        get() {
            const isEncrypted = this.getDataValue("encrypted");
            const rawValue = this.getDataValue("content");
            if (isEncrypted && rawValue) {
                try {
                    return (0, encryption_util_1.decrypt)(rawValue);
                }
                catch {
                    return "[Erreur]";
                }
            }
            return rawValue;
        },
        set(value) {
            this.setDataValue("encrypted", true);
            this.setDataValue("content", (0, encryption_util_1.encrypt)(value));
            this.setDataValue("hash", crypto_1.default.createHash("sha256").update(value).digest("hex"));
        }
    }),
    __metadata("design:type", String)
], Note.prototype, "content", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("internal_prosecution", "internal_court", "case_global"), defaultValue: "case_global" }),
    __metadata("design:type", String)
], Note.prototype, "visibility", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: true }),
    __metadata("design:type", Boolean)
], Note.prototype, "encrypted", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, defaultValue: "" }),
    __metadata("design:type", String)
], Note.prototype, "hash", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], Note.prototype, "createdAt", void 0);
Note = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Notes', timestamps: false, underscored: true })
], Note);
exports.default = Note;
