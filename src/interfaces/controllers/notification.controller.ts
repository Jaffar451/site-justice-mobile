// PATH: src/interfaces/controllers/notification.controller.ts
import { Request, Response } from 'express';
import { CustomRequest } from '../../types/express-request'; // Assure-toi que ce type existe

// ✅ Simulation "Base de données" en mémoire (Temporaire pour la démo)
// ⚠️ ATTENTION : Ces données seront réinitialisées à chaque redémarrage du serveur Render !
let mockNotifications = [
  {
    id: 1,
    title: "Bienvenue sur e-Justice",
    message: "Votre compte est actif. N'hésitez pas à compléter votre profil.",
    type: "info",
    read: false,
    priority: "normal",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Mise à jour système",
    message: "La plateforme e-Justice sera en maintenance ce soir à 23h.",
    type: "warning",
    read: false,
    priority: "high",
    createdAt: new Date(Date.now() - 10000000).toISOString()
  }
];

/**
 * GET /api/notifications
 * Récupérer la liste des notifications
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    // Dans une vraie BDD, on filtrerait par req.user.id ici
    res.status(200).json({
      success: true,
      data: mockNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marquer une notification comme lue
 */
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const index = mockNotifications.findIndex(n => n.id === id);
    
    if (index !== -1) {
      mockNotifications[index].read = true;
      res.status(200).json({ success: true, data: mockNotifications[index] });
    } else {
      res.status(404).json({ success: false, message: "Notification introuvable" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * DELETE /api/notifications/:id
 * Supprimer une notification spécifique
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    
    const initialLength = mockNotifications.length;
    mockNotifications = mockNotifications.filter(n => n.id !== id);

    if (mockNotifications.length < initialLength) {
        console.log(`🗑️ Notification ${id} supprimée (Mémoire).`);
        res.status(200).json({ success: true, message: "Notification supprimée" });
    } else {
        res.status(404).json({ success: false, message: "Notification introuvable" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

/**
 * DELETE /api/notifications/all
 * Tout supprimer
 */
export const clearAll = async (req: Request, res: Response) => {
  try {
    mockNotifications = [];
    console.log("🗑️ Toutes les notifications ont été purgées (Mémoire).");
    res.status(200).json({ success: true, message: "Toutes les notifications ont été supprimées" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};