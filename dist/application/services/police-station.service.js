"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoliceStationService = void 0;
const sequelize_1 = require("sequelize");
const database_1 = require("../../config/database");
const policeStation_model_1 = __importDefault(require("../../models/policeStation.model"));
class PoliceStationService {
    /**
     * 🏢 1. LISTE ADMINISTRATIVE COMPLÈTE
     * Utilisée par les administrateurs pour la gestion du registre (CRUD).
     */
    async getAll() {
        return await policeStation_model_1.default.findAll({
            order: [['city', 'ASC'], ['name', 'ASC']]
        });
    }
    /**
     * 🔓 2. ANNUAIRE PUBLIC (VUE CITOYENNE)
     * Retourne uniquement les informations essentielles pour le public.
     */
    async getPublicDirectory() {
        return await policeStation_model_1.default.findAll({
            // ✅ city ajouté pour permettre aux citoyens de filtrer par localité
            attributes: ['id', 'name', 'type', 'city', 'district', 'address', 'latitude', 'longitude', 'phone'],
            where: { status: 'en cours' },
            order: [['city', 'ASC'], ['district', 'ASC']]
        });
    }
    /**
     * 🔐 3. VUE ANALYTIQUE (VUE OFFICIELLE)
     * Requête performante pour calculer les taux de résolution par unité.
     */
    async getInternalStats() {
        const query = `
      SELECT 
        ps.id, 
        ps.name, 
        ps.type,
        ps.city,
        ps.district, 
        ps.address,
        ps.latitude, 
        ps.longitude, 
        ps.phone,
        ps.status,
        -- ✅ Comptage des dossiers (tables en snake_case)
        (SELECT COUNT(*) FROM complaints WHERE police_station_id = ps.id) as total_cases,
        -- ✅ Comptage des affaires résolues ou en cours de jugement
        (SELECT COUNT(*) FROM complaints 
         WHERE police_station_id = ps.id 
         AND status IN ('transmise_parquet', 'jugée', 'audience_programmée')) as resolved_cases
      FROM police_stations ps
      ORDER BY ps.city ASC, ps.name ASC;
    `;
        return await database_1.sequelize.query(query, {
            type: sequelize_1.QueryTypes.SELECT
        });
    }
}
exports.PoliceStationService = PoliceStationService;
