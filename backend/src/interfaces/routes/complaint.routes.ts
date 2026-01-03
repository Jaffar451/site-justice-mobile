// PATH: src/interfaces/routes/complaint.routes.ts
import { Router } from "express";
import { 
  createComplaint, 
  listComplaints, 
  getComplaint, 
  transmitToHierarchy, 
  validateToParquet,   
  addAttachment,
  updateComplaint // ✅ AJOUT : Import du contrôleur de mise à jour
} from "../controllers/complaint.controller";
import { authenticate, authorize } from "../../middleware/auth.middleware";

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
  authorize(["citizen"]), 
  createComplaint
);

// Lister mes plaintes (Citoyen)
router.get(
  "/me", 
  authenticate, 
  authorize(["citizen"]), 
  listComplaints
);

// Alias pour l'appel mobile /my-complaints
router.get(
  "/my-complaints", 
  authenticate, 
  authorize(["citizen"]), 
  listComplaints
);

// ✅ ROUTE POUR METTRE À JOUR UNE PLAINTE (TITRE/DESCRIPTION)
// Indispensable pour l'écran "Éditer la déclaration"
router.patch(
  "/:id",
  authenticate,
  authorize(["citizen", "police", "gendarme", "admin"]),
  updateComplaint
);

// ✅ ROUTE POUR L'UPLOAD DE PREUVES
router.post(
  "/:id/attachments",
  authenticate,
  authorize(["citizen", "police", "gendarme", "commisaire"]), 
  uploadEvidence, 
  addAttachment
);

// ==========================================
// 2. CONSULTATION GLOBALE (Police / Justice)
// ==========================================

// Lister les plaintes
router.get(
  "/", 
  authenticate, 
  authorize(["police", "commisaire", "gendarme", "prosecutor", "judge", "clerk", "admin"]), 
  listComplaints
);

// Voir le détail d'une plainte
router.get(
  "/:id", 
  authenticate, 
  authorize(["citizen", "police", "commisaire", "gendarme", "prosecutor", "judge", "clerk", "admin"]), 
  getComplaint
);

// ==========================================
// 3. WORKFLOW OPJ -> COMMISSAIRE
// ==========================================

// Transmettre au supérieur
router.put(
  "/:id/transmit", 
  authenticate, 
  authorize(["police", "gendarme"]), 
  transmitToHierarchy
);

// ==========================================
// 4. WORKFLOW COMMISSAIRE -> PARQUET
// ==========================================

// Valider et envoyer au Parquet
router.put(
  "/:id/validate-parquet", 
  authenticate, 
  authorize(["commisaire", "admin"]), 
  validateToParquet
);

export default router;