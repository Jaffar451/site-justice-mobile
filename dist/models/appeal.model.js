"use strict";
// src/models/appeal.model.ts
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
const decision_model_1 = __importDefault(require("./decision.model"));
const user_model_1 = __importDefault(require("./user.model"));
const person_model_1 = __importDefault(require("./person.model"));
let Appeal = class Appeal extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => case_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Appeal.prototype, "caseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => case_model_1.default, { as: 'case' }),
    __metadata("design:type", case_model_1.default)
], Appeal.prototype, "case", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => decision_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Appeal.prototype, "contestedDecisionId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => decision_model_1.default, { as: 'contestedDecision' }),
    __metadata("design:type", decision_model_1.default)
], Appeal.prototype, "contestedDecision", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => person_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Appeal.prototype, "appellantId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => person_model_1.default, { as: 'appellant' }),
    __metadata("design:type", person_model_1.default)
], Appeal.prototype, "appellant", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Appeal.prototype, "lawyerId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, { as: 'lawyer' }),
    __metadata("design:type", user_model_1.default)
], Appeal.prototype, "lawyer", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: false }),
    __metadata("design:type", Date)
], Appeal.prototype, "appealDate", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Appeal.prototype, "reason", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM('pending', 'accepted', 'rejected', 'withdrawn'),
        defaultValue: 'pending'
    }),
    __metadata("design:type", String)
], Appeal.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], Appeal.prototype, "decidedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], Appeal.prototype, "decisionNotes", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Appeal.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Appeal.prototype, "updatedAt", void 0);
Appeal = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Appeals', timestamps: true, underscored: true })
], Appeal);
exports.default = Appeal;
