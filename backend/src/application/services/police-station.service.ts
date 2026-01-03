import { QueryTypes } from 'sequelize';
import { sequelize } from '../../config/database';
import PoliceStation from '../../models/policeStation.model';

export class PoliceStationService {
  
  /**
   * 🏢 1. LISTE ADMINISTRATIVE COMPLÈTE
   * Utilisée par les administrateurs pour la gestion du registre (CRUD).
   */
  async getAll() {
    return await PoliceStation.findAll({
      order: [['city', 'ASC'], ['name', 'ASC']]
    });
  }

  /**
   * 🔓 2. ANNUAIRE PUBLIC (VUE CITOYENNE)
   * Retourne uniquement les informations essentielles pour le public.
   */
  async getPublicDirectory() {
    return await PoliceStation.findAll({
      // ✅ city ajouté pour permettre aux citoyens de filtrer par localité
      attributes: ['id', 'name', 'type', 'city', 'district', 'address', 'latitude', 'longitude', 'phone'],
      where: { status: 'active' }, 
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

    return await sequelize.query(query, { 
      type: QueryTypes.SELECT 
    });
  }
}