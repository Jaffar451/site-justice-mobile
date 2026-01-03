import { Request } from "express";
import AuditLog from "../../models/auditLog.model";

// Interface pour capturer l'utilisateur authentifié
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    firstname?: string;
    lastname?: string;
  };
}

/**
 * 🕵️ SERVICE DE LOG D'ACTIVITÉ
 * Enregistre les actions métier et techniques dans la table audit_logs.
 */
export const logActivity = async (
  req: AuthenticatedRequest,
  action: string,
  resourceType: string,
  resourceId: string | number,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  try {
    await AuditLog.create({
      // 1. Identification de l'acteur
      userId: req.user?.id || 0,
      action: action,

      // 2. Métadonnées techniques (Synchronisées avec les colonnes SQL ajoutées)
      method: req.method || 'INTERNAL',
      endpoint: req.originalUrl || 'N/A',
      
      // Extraction sécurisée de l'IP (gestion proxy incluse)
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',

      // 3. Métadonnées métier
      resourceType: resourceType,
      resourceId: String(resourceId),
      severity: severity,

      // ✅ CORRECTION : Ajout du champ 'details' obligatoire
      // On construit une description dynamique pour faciliter la lecture côté Admin
      details: `Action: ${action} | Ressource: ${resourceType} (#${resourceId}) | Par: ${req.user?.firstname || 'Système'}`,

      createdAt: new Date()
    });
  } catch (error: any) {
    // On log l'erreur en console mais on ne bloque pas le flux principal de l'application
    console.error("❌ [CRITICAL_AUDIT_SERVICE_ERROR]:", error.message);
  }
};