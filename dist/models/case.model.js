"use strict";
// src/models/case.model.ts
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
const complaint_model_1 = __importDefault(require("./complaint.model"));
const assignment_model_1 = __importDefault(require("./assignment.model"));
const decision_model_1 = __importDefault(require("./decision.model"));
const hearing_model_1 = __importDefault(require("./hearing.model"));
const incarceration_model_1 = __importDefault(require("./incarceration.model"));
const court_model_1 = __importDefault(require("./court.model"));
const evidence_model_1 = __importDefault(require("./evidence.model"));
const attachment_model_1 = __importDefault(require("./attachment.model"));
const procesVerbal_model_1 = __importDefault(require("./procesVerbal.model"));
let CaseModel = class CaseModel extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, unique: true }),
    __metadata("design:type", String)
], CaseModel.prototype, "reference", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], CaseModel.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("criminal", "civil", "other"), defaultValue: "criminal" }),
    __metadata("design:type", String)
], CaseModel.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("low", "medium", "high"), defaultValue: "medium" }),
    __metadata("design:type", String)
], CaseModel.prototype, "priority", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM("prosecution_review", "instruction", "trial", "appeal", "execution", "archived"),
        defaultValue: "prosecution_review"
    }),
    __metadata("design:type", String)
], CaseModel.prototype, "stage", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], CaseModel.prototype, "openedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, allowNull: true }),
    __metadata("design:type", Date)
], CaseModel.prototype, "closedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => complaint_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], CaseModel.prototype, "complaintId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => complaint_model_1.default, { as: 'sourceComplaint' }),
    __metadata("design:type", complaint_model_1.default)
], CaseModel.prototype, "sourceComplaint", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => court_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], CaseModel.prototype, "courtId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => court_model_1.default, { as: 'court' }),
    __metadata("design:type", court_model_1.default)
], CaseModel.prototype, "court", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => assignment_model_1.default, { as: 'assignments' }),
    __metadata("design:type", Array)
], CaseModel.prototype, "assignments", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => decision_model_1.default, { as: 'caseDecisions' }),
    __metadata("design:type", Array)
], CaseModel.prototype, "caseDecisions", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => hearing_model_1.default, { as: 'caseHearings' }),
    __metadata("design:type", Array)
], CaseModel.prototype, "caseHearings", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => evidence_model_1.default, { as: 'evidence' }),
    __metadata("design:type", Array)
], CaseModel.prototype, "evidence", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => attachment_model_1.default, { as: 'attachments' }),
    __metadata("design:type", Array)
], CaseModel.prototype, "attachments", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => procesVerbal_model_1.default, { as: 'procesVerbaux' }),
    __metadata("design:type", Array)
], CaseModel.prototype, "procesVerbaux", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => incarceration_model_1.default, { as: 'incarcerationRecord' }),
    __metadata("design:type", incarceration_model_1.default)
], CaseModel.prototype, "incarcerationRecord", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], CaseModel.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], CaseModel.prototype, "updatedAt", void 0);
CaseModel = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Cases', timestamps: true, underscored: true })
], CaseModel);
exports.default = CaseModel;
