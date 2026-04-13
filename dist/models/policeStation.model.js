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
const complaint_model_1 = __importDefault(require("./complaint.model"));
const sosAlert_model_1 = __importDefault(require("./sosAlert.model"));
let PoliceStation = class PoliceStation extends sequelize_typescript_1.Model {
};
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: false }),
    __metadata("design:type", String)
], PoliceStation.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.ENUM("POLICE", "GENDARMERIE"), defaultValue: "POLICE" }),
    __metadata("design:type", String)
], PoliceStation.prototype, "type", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, defaultValue: "Niamey" }),
    __metadata("design:type", String)
], PoliceStation.prototype, "city", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PoliceStation.prototype, "district", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PoliceStation.prototype, "address", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)({ type: sequelize_typescript_1.DataType.STRING, allowNull: true }),
    __metadata("design:type", String)
], PoliceStation.prototype, "phone", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => user_model_1.default, { as: 'agents' }),
    __metadata("design:type", Array)
], PoliceStation.prototype, "agents", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => complaint_model_1.default, { as: 'receivedComplaints' }),
    __metadata("design:type", Array)
], PoliceStation.prototype, "receivedComplaints", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => sosAlert_model_1.default, { as: 'receivedAlerts' }),
    __metadata("design:type", Array)
], PoliceStation.prototype, "receivedAlerts", void 0);
__decorate([
    sequelize_typescript_1.CreatedAt,
    __metadata("design:type", Date)
], PoliceStation.prototype, "createdAt", void 0);
__decorate([
    sequelize_typescript_1.UpdatedAt,
    __metadata("design:type", Date)
], PoliceStation.prototype, "updatedAt", void 0);
PoliceStation = __decorate([
    (0, sequelize_typescript_1.Table)({ tableName: 'police_stations', timestamps: true, underscored: true })
], PoliceStation);
exports.default = PoliceStation;
