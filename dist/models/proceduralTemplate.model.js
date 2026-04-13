"use strict";
// src/models/proceduralTemplate.model.ts
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
const offenseCategory_model_1 = __importDefault(require("./offenseCategory.model"));
let ProceduralTemplate = class ProceduralTemplate extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], ProceduralTemplate.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], ProceduralTemplate.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => offenseCategory_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], ProceduralTemplate.prototype, "offenseCategoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => offenseCategory_model_1.default, { as: 'offenseCategory' }),
    __metadata("design:type", offenseCategory_model_1.default)
], ProceduralTemplate.prototype, "offenseCategory", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('criminal', 'civil', 'other'),
        allowNull: false,
        defaultValue: 'criminal'
    }),
    __metadata("design:type", String)
], ProceduralTemplate.prototype, "caseType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('parquet', 'instruction', 'direct_trial'),
        allowNull: false
    }),
    __metadata("design:type", String)
], ProceduralTemplate.prototype, "proceduralRoute", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: true }),
    __metadata("design:type", Boolean)
], ProceduralTemplate.prototype, "isActive", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], ProceduralTemplate.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], ProceduralTemplate.prototype, "updatedAt", void 0);
ProceduralTemplate = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'ProceduralTemplates', timestamps: true, underscored: true })
], ProceduralTemplate);
exports.default = ProceduralTemplate;
