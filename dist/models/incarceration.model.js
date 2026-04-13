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
const detainee_model_1 = __importDefault(require("./detainee.model"));
const prison_model_1 = __importDefault(require("./prison.model"));
const case_model_1 = __importDefault(require("./case.model"));
let Incarceration = class Incarceration extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => detainee_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Incarceration.prototype, "detaineeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => detainee_model_1.default, { as: 'detaineeData' }),
    __metadata("design:type", detainee_model_1.default)
], Incarceration.prototype, "detaineeData", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => prison_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Incarceration.prototype, "prisonId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => prison_model_1.default, { as: 'detentionCenter' }),
    __metadata("design:type", prison_model_1.default)
], Incarceration.prototype, "detentionCenter", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => case_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Incarceration.prototype, "caseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => case_model_1.default, { as: 'legalBasis' }),
    __metadata("design:type", case_model_1.default)
], Incarceration.prototype, "legalBasis", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], Incarceration.prototype, "entryDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], Incarceration.prototype, "expectedReleaseDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], Incarceration.prototype, "actualReleaseDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("preventive", "convicted", "released", "escaped"), defaultValue: "preventive" }),
    __metadata("design:type", String)
], Incarceration.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Incarceration.prototype, "cellNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], Incarceration.prototype, "observation", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Incarceration.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Incarceration.prototype, "updatedAt", void 0);
Incarceration = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'incarcerations', timestamps: true, underscored: true })
], Incarceration);
exports.default = Incarceration;
