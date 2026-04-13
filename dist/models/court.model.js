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
const user_model_1 = __importDefault(require("./user.model"));
const case_model_1 = __importDefault(require("./case.model"));
const hearing_model_1 = __importDefault(require("./hearing.model"));
const decision_model_1 = __importDefault(require("./decision.model"));
let Court = class Court extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Court.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: "Niamey" }),
    __metadata("design:type", String)
], Court.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Court.prototype, "jurisdiction", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], Court.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("active", "inactive"), defaultValue: "active" }),
    __metadata("design:type", String)
], Court.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => user_model_1.default, { as: 'personnelCourt' }),
    __metadata("design:type", Array)
], Court.prototype, "personnelCourt", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => case_model_1.default, { as: 'courtCases' }),
    __metadata("design:type", Array)
], Court.prototype, "courtCases", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => hearing_model_1.default, { as: 'hearings' }),
    __metadata("design:type", Array)
], Court.prototype, "hearings", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => decision_model_1.default, { as: 'decisions' }),
    __metadata("design:type", Array)
], Court.prototype, "decisions", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Court.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Court.prototype, "updatedAt", void 0);
Court = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'courts', timestamps: true, underscored: true })
], Court);
exports.default = Court;
