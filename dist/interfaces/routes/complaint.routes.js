"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
// 🔧 Remplacer l'import ES6 par require + destructuring
const complaintController = require("../controllers");
const { createComplaint, listComplaints, getComplaint, getMyComplaints, transmitToHierarchy, validateToParquet, addAttachment, updateComplaint, transitionComplaint, getAvailableTransitions, } = complaintController;
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const upload_evidence_middleware_1 = require("../../middleware/upload-evidence.middleware");
const router = (0, express_1.Router)();
// ======================================================
// 1. CITOYEN (création + consultation personnelle)
// ======================================================
router.post("/", auth_middleware_1.authenticate, role_middleware_1.onlyCitizen, createComplaint);
router.get("/me", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("citizen", "officier_police", "gendarme", "commissaire"), getMyComplaints);
router.get("/my-complaints", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("citizen", "officier_police", "gendarme", "commissaire"), getMyComplaints);
router.patch("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("citizen", "officier_police", "gendarme", "admin"), updateComplaint);
router.post("/:id/attachments", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("citizen", "officier_police", "gendarme", "commissaire"), upload_evidence_middleware_1.uploadEvidence, addAttachment);
// ======================================================
// 2. CONSULTATION OPÉRATIONNELLE (POLICE / JUSTICE)
// ======================================================
router.get("/", auth_middleware_1.authenticate, role_middleware_1.onlyOfficialAgents, listComplaints);
router.get("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("citizen", "officier_police", "commissaire", "gendarme", "prosecutor", "judge", "greffier", "admin"), getComplaint);
// ======================================================
// 3. MACHINE D'ÉTATS (WORKFLOW)
// ======================================================
router.get("/:id/transitions", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("officier_police", "inspecteur", "commissaire", "prosecutor", "admin"), getAvailableTransitions);
router.post("/:id/transition", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("officier_police", "inspecteur", "commissaire", "prosecutor", "admin"), transitionComplaint);
// ======================================================
// 4. ACTION MÉTIER OPJ / COMMISSAIRE / PARQUET
// ======================================================
// OPJ / Gendarme / Inspecteur / Commissaire
router.post("/:id/transmit", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("officier_police", "gendarme", "inspecteur"), transmitToHierarchy);
// Commissaire / Admin uniquement
router.put("/:id/validate-parquet", auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)("commissaire", "admin"), validateToParquet);
exports.default = router;
