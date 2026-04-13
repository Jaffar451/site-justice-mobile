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
const policeStation_model_1 = __importDefault(require("./policeStation.model"));
const case_model_1 = __importDefault(require("./case.model"));
const complaintFile_model_1 = __importDefault(require("./complaintFile.model"));
const offenseCategory_model_1 = __importDefault(require("./offenseCategory.model"));
const attachment_model_1 = __importDefault(require("./attachment.model"));
let Complaint = class Complaint extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: "Plainte sans titre" }),
    __metadata("design:type", String)
], Complaint.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.TEXT, allowNull: false }),
    __metadata("design:type", String)
], Complaint.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: "general" }),
    __metadata("design:type", String)
], Complaint.prototype, "category", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM("soumise", "en_cours_OPJ", "attente_validation", "transmise_parquet", "classée_sans_suite_par_OPJ", "classée_sans_suite_par_procureur", "figée"),
        defaultValue: "soumise"
    }),
    __metadata("design:type", String)
], Complaint.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DATE, defaultValue: sequelize_typescript_1.DataType.NOW }),
    __metadata("design:type", Date)
], Complaint.prototype, "filedAt", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Complaint.prototype, "location", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(10, 8), allowNull: true }),
    __metadata("design:type", Number)
], Complaint.prototype, "latitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.DECIMAL(11, 8), allowNull: true }),
    __metadata("design:type", Number)
], Complaint.prototype, "longitude", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.BOOLEAN, defaultValue: false }),
    __metadata("design:type", Boolean)
], Complaint.prototype, "validatedByCommissaire", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], Complaint.prototype, "caseNumber", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, unique: true }),
    __metadata("design:type", String)
], Complaint.prototype, "trackingCode", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.UUID, defaultValue: sequelize_typescript_1.DataType.UUIDV4, unique: true }),
    __metadata("design:type", String)
], Complaint.prototype, "verification_token", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: false }),
    __metadata("design:type", Number)
], Complaint.prototype, "citizenId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, { as: 'complainant' }),
    __metadata("design:type", user_model_1.default)
], Complaint.prototype, "complainant", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => policeStation_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Complaint.prototype, "policeStationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => policeStation_model_1.default, { as: 'originStation' }),
    __metadata("design:type", policeStation_model_1.default)
], Complaint.prototype, "originStation", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => user_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Complaint.prototype, "assignedOpjId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => user_model_1.default, { as: 'assignedOPJ' }),
    __metadata("design:type", user_model_1.default)
], Complaint.prototype, "assignedOPJ", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => offenseCategory_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], Complaint.prototype, "offenseCategoryId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => offenseCategory_model_1.default, { as: 'offenseCategory' }),
    __metadata("design:type", offenseCategory_model_1.default)
], Complaint.prototype, "offenseCategory", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => case_model_1.default, { as: 'judicialCase' }),
    __metadata("design:type", case_model_1.default)
], Complaint.prototype, "judicialCase", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => complaintFile_model_1.default, { as: 'attachedFiles' }),
    __metadata("design:type", Array)
], Complaint.prototype, "attachedFiles", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => attachment_model_1.default, { as: 'attachments' }),
    __metadata("design:type", Array)
], Complaint.prototype, "attachments", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], Complaint.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], Complaint.prototype, "updatedAt", void 0);
Complaint = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'Complaints', timestamps: true, underscored: true })
], Complaint);
exports.default = Complaint;
