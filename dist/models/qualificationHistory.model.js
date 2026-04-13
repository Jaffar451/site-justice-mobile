"use strict";
// src/models/qualificationHistory.model.ts
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
const offense_model_1 = __importDefault(require("./offense.model"));
const user_model_1 = __importDefault(require("./user.model"));
let QualificationHistory = class QualificationHistory extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => case_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], QualificationHistory.prototype, "caseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => case_model_1.default, { as: 'case' }),
    __metadata("design:type", case_model_1.default)
], QualificationHistory.prototype, "case", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => offense_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], QualificationHistory.prototype, "fromOffenseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => offense_model_1.default, { as: 'fromOffense' }),
    __metadata("design:type", offense_model_1.default)
], QualificationHistory.prototype, "fromOffense", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => offense_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], QualificationHistory.prototype, "toOffenseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => offense_model_1.default, { as: 'toOffense' }),
    __metadata("design:type", offense_model_1.default)
], QualificationHistory.prototype, "toOffense", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], QualificationHistory.prototype, "reason", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], QualificationHistory.prototype, "changedById", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, { as: 'changedBy' }),
    __metadata("design:type", user_model_1.default)
], QualificationHistory.prototype, "changedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], QualificationHistory.prototype, "changedAt", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], QualificationHistory.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], QualificationHistory.prototype, "updatedAt", void 0);
QualificationHistory = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'QualificationHistories', timestamps: true, underscored: true })
], QualificationHistory);
exports.default = QualificationHistory;
