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
exports.UserRole = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const policeStation_model_1 = __importDefault(require("./policeStation.model"));
const court_model_1 = __importDefault(require("./court.model"));
const prison_model_1 = __importDefault(require("./prison.model"));
const refreshToken_model_1 = __importDefault(require("./refreshToken.model"));
const auditLog_model_1 = __importDefault(require("./auditLog.model"));
const complaint_model_1 = __importDefault(require("./complaint.model"));
const detainee_model_1 = __importDefault(require("./detainee.model"));
const sosAlert_model_1 = __importDefault(require("./sosAlert.model"));
const person_model_1 = __importDefault(require("./person.model"));
const professionnalProfile_model_1 = __importDefault(require("./professionnalProfile.model"));
// ✅ DÉFINITION DES RÔLES
var UserRole;
(function (UserRole) {
    // --- Administration ---
    UserRole["ADMIN"] = "admin";
    // --- Justice (Magistrats & Greffe) ---
    UserRole["PROSECUTOR"] = "prosecutor";
    UserRole["JUDGE"] = "judge";
    UserRole["CLERK"] = "greffier";
    // --- Forces de l'Ordre (OPJ & Agents) ---
    UserRole["COMMISSAIRE"] = "commissaire";
    UserRole["OFFICIER_POLICE"] = "officier_police";
    UserRole["INSPECTEUR"] = "inspecteur";
    UserRole["OPJ_GENDARME"] = "opj_gendarme";
    UserRole["GENDARME"] = "gendarme";
    // --- Pénitentiaire ---
    UserRole["PRISON_GUARD"] = "prison_guard";
    UserRole["PRISON_DIRECTOR"] = "prison_director";
    // --- Public ---
    UserRole["CITIZEN"] = "citizen";
    UserRole["LAWYER"] = "lawyer"; // Avocat
})(UserRole || (exports.UserRole = UserRole = {}));
let User = class User extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "firstname", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "lastname", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false, unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING,
        allowNull: true, // Optionnel (les citoyens n'en ont pas)
        unique: true // S'il existe, il doit être unique
    }),
    __metadata("design:type", String)
], User.prototype, "matricule", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], User.prototype, "telephone", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.ENUM(...Object.values(UserRole)),
        defaultValue: UserRole.CITIZEN
    }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], User.prototype, "organization", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], User.prototype, "district", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], User.prototype, "pushToken", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => person_model_1.default, { as: 'personProfile', foreignKey: 'userId' }),
    __metadata("design:type", person_model_1.default)
], User.prototype, "personProfile", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => professionnalProfile_model_1.default, { as: 'professionalProfile', foreignKey: 'userId' }),
    __metadata("design:type", professionnalProfile_model_1.default)
], User.prototype, "professionalProfile", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => policeStation_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], User.prototype, "policeStationId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => policeStation_model_1.default, { as: 'station' }),
    __metadata("design:type", policeStation_model_1.default)
], User.prototype, "station", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => court_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], User.prototype, "courtId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => court_model_1.default, { as: 'court' }),
    __metadata("design:type", court_model_1.default)
], User.prototype, "court", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => prison_model_1.default),
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.INTEGER, allowNull: true }),
    __metadata("design:type", Number)
], User.prototype, "prisonId", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => prison_model_1.default, { as: 'prison' }),
    __metadata("design:type", prison_model_1.default)
], User.prototype, "prison", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => auditLog_model_1.default, { as: 'auditLogs' }),
    __metadata("design:type", Array)
], User.prototype, "auditLogs", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => refreshToken_model_1.default, { as: 'authSession' }),
    __metadata("design:type", refreshToken_model_1.default)
], User.prototype, "authSession", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => complaint_model_1.default, { as: 'filedComplaints' }),
    __metadata("design:type", Array)
], User.prototype, "filedComplaints", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => sosAlert_model_1.default, { as: 'sentAlerts' }),
    __metadata("design:type", Array)
], User.prototype, "sentAlerts", void 0);
__decorate([
    (0, sequelize_typescript_1.HasOne)(() => detainee_model_1.default, { as: 'detaineeProfile' }),
    __metadata("design:type", detainee_model_1.default)
], User.prototype, "detaineeProfile", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'users', timestamps: true, underscored: true })
], User);
exports.default = User;
