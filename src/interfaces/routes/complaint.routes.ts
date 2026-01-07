import { Router } from "express";
import { 
  createComplaint, 
  listComplaints, 
  getComplaint, 
  transmitToHierarchy, 
  validateToParquet,   
  addAttachment,
  updateComplaint 
} from "../controllers/complaint.controller";

// ✅ Import des middlewares corrigés
import { authenticate } from "../../middleware/auth.middleware";
import { 
  onlyCitizen, 
  onlyOfficialAgents, 
  requireRole 
} from "../../middleware/role.middleware";

// ✅ Import du middleware d'upload
import { uploadEvidence } from "../../middleware/upload-evidence.middleware"; 

const router = Router();

// ==========================================
// 1. ROUTES CITOYENS (Dépôt & Suivi)
// ==========================================

// Déposer une nouvelle plainte
router.post(
  "/", 
  authenticate, 
  onlyCitizen, 
  createComplaint
);

// Lister mes plaintes (Citoyen)
router.get(
  "/me", 
  authenticate, 
  onlyCitizen, 
  listComplaints
);

router.get(
  "/my-complaints", 
  authenticate, 
  onlyCitizen, 
  listComplaints
);

// ✅ MISE À JOUR PLAINTE (Synchronisé avec DB)
router.patch(
  "/:id",
  authenticate,
  requireRole("citizen", "officier_police", "gendarme", "admin"),
  updateComplaint
);

// ✅ UPLOAD DE PREUVES (Synchronisé avec DB)
router.post(
  "/:id/attachments",
  authenticate,
  requireRole("citizen", "officier_police", "gendarme", "commissaire"), 
  uploadEvidence, 
  addAttachment
);

// ==========================================
// 2. CONSULTATION GLOBALE (Police / Justice)
// ==========================================

// Lister toutes les plaintes (Pour les agents de l'État)
router.get(
  "/", 
  authenticate, 
  onlyOfficialAgents, // ✅ Utilise le groupe incluant 'officier_police'
  listComplaints
);

// Voir le détail
router.get(
  "/:id", 
  authenticate, 
  requireRole("citizen", "officier_police", "commissaire", "gendarme", "prosecutor", "judge", "greffier", "admin"), 
  getComplaint
);

// ==========================================
// 3. WORKFLOW OPJ -> COMMISSAIRE
// ==========================================

router.put(
  "/:id/transmit", 
  authenticate, 
  requireRole("officier_police", "gendarme"), 
  transmitToHierarchy
);

// ==========================================
// 4. WORKFLOW COMMISSAIRE -> PARQUET
// ==========================================

router.put(
  "/:id/validate-parquet", 
  authenticate, 
  requireRole("commissaire", "admin"), 
  validateToParquet
);

export default router;