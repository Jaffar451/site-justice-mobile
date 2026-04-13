import { Router } from "express";
import {
  createComplaint,
  listComplaints,
  getComplaint,
  getMyComplaints,
  transmitToHierarchy,
  validateToParquet,
  addAttachment,
  updateComplaint,
  transitionComplaint,
  getAvailableTransitions,
} from "../controllers/complaint.controller";
import { authenticate } from "../../middleware/auth.middleware";
import {
  onlyCitizen,
  onlyOfficialAgents,
  requireRole,
} from "../../middleware/role.middleware";
import { uploadEvidence } from "../../middleware/upload-evidence.middleware";
const router = Router();
router.post("/", authenticate, onlyCitizen, createComplaint);
router.get(
  "/me",
  authenticate,
  requireRole("citizen", "officier_police", "gendarme", "commissaire"),
  getMyComplaints,
);
router.get(
  "/my-complaints",
  authenticate,
  requireRole("citizen", "officier_police", "gendarme", "commissaire"),
  getMyComplaints,
);
router.patch(
  "/:id",
  authenticate,
  requireRole("citizen", "officier_police", "gendarme", "admin"),
  updateComplaint,
);
router.post(
  "/:id/attachments",
  authenticate,
  requireRole("citizen", "officier_police", "gendarme", "commissaire"),
  uploadEvidence,
  addAttachment,
);
router.get("/", authenticate, onlyOfficialAgents, listComplaints);
router.get(
  "/:id",
  authenticate,
  requireRole(
    "citizen",
    "officier_police",
    "commissaire",
    "gendarme",
    "prosecutor",
    "judge",
    "greffier",
    "admin",
  ),
  getComplaint,
);
router.get(
  "/:id/transitions",
  authenticate,
  requireRole(
    "officier_police",
    "inspecteur",
    "commissaire",
    "prosecutor",
    "admin",
  ),
  getAvailableTransitions,
);
router.post(
  "/:id/transition",
  authenticate,
  requireRole(
    "officier_police",
    "inspecteur",
    "commissaire",
    "prosecutor",
    "admin",
  ),
  transitionComplaint,
);
router.post(
  "/:id/transmit",
  authenticate,
  requireRole("officier_police", "gendarme", "inspecteur"),
  transmitToHierarchy,
);
router.put(
  "/:id/validate-parquet",
  authenticate,
  requireRole("commissaire", "admin"),
  validateToParquet,
);
export default router;
