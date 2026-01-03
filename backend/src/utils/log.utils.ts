// PATH: src/utils/log.utils.ts
import { Request } from "express";
import AuditLog from "../models/auditLog.model";

interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    role: string;
    matricule?: string;
  };
}

export const logActivity = async (
  req: AuthenticatedRequest,
  action: string,
  details: string = "",
  resourceType: string = "SYSTEM",
  resourceId: string | number | null = null,
  severity: 'info' | 'warning' | 'critical' = 'info'
) => {
  try {
    const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
               req.socket.remoteAddress || 
               'unknown';

    await AuditLog.create({
      // ✅ CORRECTION 1 : Si pas d'utilisateur (ex: login échoué), on met 0 au lieu de null
      userId: req.user?.id ?? 0, 
      
      action,
      details,
      resourceType,

      // ✅ CORRECTION 2 : Si pas d'ID de ressource, on met "N/A" au lieu de null
      resourceId: resourceId ? String(resourceId) : "N/A", 

      ipAddress: ip,
      userAgent: req.headers['user-agent'] || 'unknown',
      severity,
      createdAt: new Date()
    });

  } catch (error) {
    console.error("❌ AUDIT_LOG_FAILURE:", error);
  }
};