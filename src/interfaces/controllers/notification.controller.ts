// @ts-nocheck
import { Request, Response } from 'express';

// ✅ Simulation "Base de données" en mémoire
let mockNotifications = [
  {
    id: 1,
    title: "Bienvenue sur e-Justice",
    message: "Votre compte administrateur est actif et prêt à l'emploi.",
    type: "info",
    read: false,
    priority: "normal",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Alerte de Sécurité",
    message: "Tentative de connexion échouée détectée depuis l'IP 192.168.1.15.",
    type: "alert",
    read: false,
    priority: "high",
    createdAt: new Date(Date.now() - 10000000).toISOString()
  }
];

export class NotificationController {
  
  /**
   * GET /api/notifications
   */
  public async getNotifications(req: Request, res: Response) {
    res.status(200).json({
      success: true,
      data: mockNotifications
    });
  }

  /**
   * PATCH /api/notifications/:id/read
   */
  public async markAsRead(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const index = mockNotifications.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotifications[index].read = true;
    }
    res.status(200).json({ success: true });
  }

  /**
   * DELETE /api/notifications/:id
   * ✅ NOUVELLE MÉTHODE : Supprimer une notification spécifique
   */
  public async deleteNotification(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    
    // On garde toutes les notifs SAUF celle qui a l'ID demandé
    const initialLength = mockNotifications.length;
    mockNotifications = mockNotifications.filter(n => n.id !== id);

    if (mockNotifications.length < initialLength) {
        console.log(`🗑️ Notification ${id} supprimée.`);
        res.status(200).json({ success: true });
    } else {
        res.status(404).json({ success: false, message: "Notification introuvable" });
    }
  }

  /**
   * DELETE /api/notifications/all
   */
  public async clearAll(req: Request, res: Response) {
    mockNotifications = [];
    console.log("🗑️ Toutes les notifications supprimées.");
    res.status(200).json({ success: true });
  }
}