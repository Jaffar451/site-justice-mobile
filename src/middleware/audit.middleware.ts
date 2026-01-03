import { Response, NextFunction } from "express";
import { AuditLog } from "../models"; 
import { CustomRequest } from "../types/express-request";

/**
 * 🕵️ MIDDLEWARE D'AUDIT GLOBAL
 * Ce middleware intercepte la réponse à la fin du cycle de requête
 * pour enregistrer l'activité de l'utilisateur.
 */
export const auditAction = (action: string, severity: 'info' | 'warning' | 'critical' = 'info') => {
  return async (req: CustomRequest, res: Response, next: NextFunction) => {
    
    // On écoute l'événement 'finish' pour s'assurer que la requête est terminée
    res.on('finish', async () => {
      try {
        // Optionnel : On n'enregistre que les succès ou les erreurs spécifiques (2xx, 4xx, 5xx)
        // Ici on enregistre tout ce qui n'est pas une simple lecture (GET) pour l'audit métier,
        // ou tout si vous voulez un log technique complet.
        
        await AuditLog.create({
          // 1. Identification de l'acteur (via votre middleware d'auth)
          userId: req.user?.id || 0,
          action: action,

          // 2. Détails techniques (Synchronisés avec les colonnes SQL)
          method: req.method,
          endpoint: req.originalUrl,
          // ✅ Correction : ipAddress mappe vers ip_address en BDD
          ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',

          // 3. Métriques métier
          severity: severity,
          status: res.statusCode >= 400 ? 'FAILURE' : 'SUCCESS',
          
          // Construction d'un détail lisible pour l'admin
          details: `Route: ${req.originalUrl} | Status: ${res.statusCode} | User: ${req.user?.firstname || 'Anonyme'} ${req.user?.lastname || ''}`,
          
          // Resource (Facultatif, peut être enrichi par le contrôleur)
          resourceType: 'API_ENDPOINT',
          resourceId: 'N/A'
        });

      } catch (error: any) {
        // Erreur silencieuse en prod pour ne pas bloquer le client, mais loguée sur le serveur
        console.error("⚠️ [AUDIT_MIDDLEWARE_ERROR]:", error.message);
      }
    });

    next();
  };
};