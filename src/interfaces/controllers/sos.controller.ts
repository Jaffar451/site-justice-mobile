import { Response } from "express";
import { SosAlert, PoliceStation, User } from "../../models";
import { CustomRequest } from "../../types/express-request";
import { io } from "../../config/socket";

/**
 * Calcule la distance en KM entre deux points GPS (Formule de Haversine)
 */
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

/**
 * 🚨 POST /api/sos
 * Déclenche une alerte vers le commissariat le plus proche
 */
export const createSosAlert = async (req: CustomRequest, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ message: "Coordonnées GPS requises" });
    }

    const stations = await PoliceStation.findAll();
    
    if (stations.length === 0) {
      return res.status(404).json({ message: "Aucun commissariat disponible" });
    }

    let nearestStation: any = null;
    let minDistance = Infinity;

    stations.forEach(station => {
      if (station.latitude !== null && station.longitude !== null) {
        const dist = calculateDistance(
          Number(latitude), 
          Number(longitude), 
          Number(station.latitude), 
          Number(station.longitude)
        );

        if (dist < minDistance) {
          minDistance = dist;
          nearestStation = station;
        }
      }
    });

    if (!nearestStation) {
      return res.status(404).json({ message: "Localisation du commissariat impossible" });
    }

    // 1. ✅ CORRECTION : Utilisation de Number() pour correspondre au type INTEGER de la BDD
    const alert = await SosAlert.create({
      userId: Number(req.user!.id), 
      policeStationId: Number(nearestStation.id),
      latitude: Number(latitude),
      longitude: Number(longitude),
      status: 'pending'
    });

    // 2. ENVOI TEMPS RÉEL (Socket.io)
    if (io) {
      io.to(`station_${nearestStation.id}`).emit("new_sos_alert", {
        alertId: alert.id,
        senderName: `${req.user?.firstname} ${req.user?.lastname}`,
        senderPhone: req.user?.telephone,
        latitude: Number(latitude),
        longitude: Number(longitude),
        distance: minDistance.toFixed(2),
        timestamp: new Date()
      });
    }

    return res.status(201).json({
      message: "Alerte SOS transmise",
      station: nearestStation.name,
      distance: `${minDistance.toFixed(2)} km`
    });

  } catch (error) {
    console.error("Erreur SOS:", error);
    return res.status(500).json({ message: "Erreur lors du déclenchement du SOS" });
  }
};

/**
 * 📋 GET /api/sos/station/:stationId
 * Liste des alertes pour un commissariat spécifique
 */
export const getStationAlerts = async (req: CustomRequest, res: Response) => {
  try {
    const { stationId } = req.params;

    const alerts = await SosAlert.findAll({
      where: { policeStationId: stationId },
      include: [
        { 
          model: User, 
          as: 'sender', 
          attributes: ['firstname', 'lastname', 'telephone'] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json(alerts);
  } catch (error) {
    console.error("Erreur Get Alerts:", error);
    return res.status(500).json({ message: "Erreur de récupération" });
  }
};