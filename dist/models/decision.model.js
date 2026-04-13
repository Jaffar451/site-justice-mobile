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
const court_model_1 = __importDefault(require("./court.model"));
const user_model_1 = __importDefault(require("./user.model"));
const sentence_model_1 = __importDefault(require("./sentence.model"));
let Decision = class Decision extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => case_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Decision.prototype, "caseId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => case_model_1.default, { as: 'case' }),
    __metadata("design:type", case_model_1.default)
], Decision.prototype, "case", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => court_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Decision.prototype, "courtId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => court_model_1.default, { as: 'court' }),
    __metadata("design:type", court_model_1.default)
], Decision.prototype, "court", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Decision.prototype, "judgeId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, { as: 'judge' }),
    __metadata("design:type", user_model_1.default)
], Decision.prototype, "judge", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("judgment_first_instance", "judgment_appeal", "order_instruction", "order_provisional", "other"), defaultValue: "judgment_first_instance" }),
    __metadata("design:type", String)
], Decision.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Decision.prototype, "verdict", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: true }),
    __metadata("design:type", String)
], Decision.prototype, "legalBasis", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], Decision.prototype, "date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, unique: true }),
    __metadata("design:type", String)
], Decision.prototype, "decisionNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => sentence_model_1.default, { as: 'sentences' }),
    __metadata("design:type", Array)
], Decision.prototype, "sentences", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Decision.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Decision.prototype, "updatedAt", void 0);
Decision = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Decisions', timestamps: true, underscored: true })
], Decision);
exports.default = Decision;
