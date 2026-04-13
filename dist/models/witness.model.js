"use strict";
// src/models/witness.model.ts
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
const person_model_1 = __importDefault(require("./person.model"));
const hearing_model_1 = __importDefault(require("./hearing.model"));
const case_model_1 = __importDefault(require("./case.model"));
let Witness = class Witness extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => person_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Witness.prototype, "personId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => person_model_1.default, { as: 'person' }),
    __metadata("design:type", person_model_1.default)
], Witness.prototype, "person", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => hearing_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Witness.prototype, "hearingId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => hearing_model_1.default, { as: 'hearing' }),
    __metadata("design:type", hearing_model_1.default)
], Witness.prototype, "hearing", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => case_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Witness.prototype, "caseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => case_model_1.default, { as: 'case' }),
    __metadata("design:type", case_model_1.default)
], Witness.prototype, "case", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Witness.prototype, "statement", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('favorable', 'défavorable', 'neutre'),
        allowNull: true
    }),
    __metadata("design:type", String)
], Witness.prototype, "statementType", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], Witness.prototype, "isAnonymous", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Witness.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Witness.prototype, "updatedAt", void 0);
Witness = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Witnesses', timestamps: true, underscored: true })
], Witness);
exports.default = Witness;
