"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/interfaces/routes/index.ts
const express_1 = require("express");
// ==========================================
// 1. SÉCURITÉ, INFRASTRUCTURE & ADMINISTRATION
// ==========================================
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const audit_routes_1 = __importDefault(require("./audit.routes"));
const admin_routes_1 = __importDefault(require("./admin.routes"));
const notification_routes_1 = __importDefault(require("./notification.routes"));
const court_routes_1 = __importDefault(require("./court.routes"));
const prison_routes_1 = __importDefault(require("./prison.routes"));
const lawyer_routes_1 = __importDefault(require("./lawyer.routes"));
const bailiff_routes_1 = __importDefault(require("./bailiff.routes"));
const citizen_routes_1 = __importDefault(require("./citizen.routes"));
// ==========================================
// 2. SIG, POLICE & ALERTES
// ==========================================
const policeStation_routes_1 = __importDefault(require("./policeStation.routes"));
const sos_routes_1 = __importDefault(require("./sos.routes"));
// ==========================================
// 3. COEUR DU WORKFLOW JUDICIAIRE
// ==========================================
const complaint_routes_1 = __importDefault(require("./complaint.routes"));
const case_routes_1 = __importDefault(require("./case.routes"));
const workflow_routes_1 = __importDefault(require("./workflow.routes"));
const assignment_routes_1 = __importDefault(require("./assignment.routes"));
const decision_routes_1 = __importDefault(require("./decision.routes"));
const hearing_routes_1 = __importDefault(require("./hearing.routes"));
// ==========================================
// 4. ACTES DE PROCÉDURE & DOCUMENTS
// ==========================================
const summon_routes_1 = __importDefault(require("./summon.routes"));
const arrestWarrant_routes_1 = __importDefault(require("./arrestWarrant.routes"));
const searchWarrant_routes_1 = __importDefault(require("./searchWarrant.routes"));
const witness_routes_1 = __importDefault(require("./witness.routes"));
const evidence_routes_1 = __importDefault(require("./evidence.routes"));
const attachment_routes_1 = __importDefault(require("./attachment.routes"));
const note_routes_1 = __importDefault(require("./note.routes"));
// ==========================================
// 5. DÉTENTION, INCARCÉRATION & PEINES
// ==========================================
const incarceration_routes_1 = __importDefault(require("./incarceration.routes"));
const indictment_routes_1 = __importDefault(require("./indictment.routes"));
const custodyExtension_routes_1 = __importDefault(require("./custodyExtension.routes"));
const preventiveDetention_routes_1 = __importDefault(require("./preventiveDetention.routes"));
const release_routes_1 = __importDefault(require("./release.routes"));
const sentence_routes_1 = __importDefault(require("./sentence.routes"));
const confiscation_routes_1 = __importDefault(require("./confiscation.routes"));
const custody_routes_1 = __importDefault(require("./custody.routes")); // ⬅️ AJOUT : Import manquant !
// ==========================================
// 6. SUITES LÉGALES, RÉPARATIONS & APPELS
// ==========================================
const reparation_routes_1 = __importDefault(require("./reparation.routes"));
const appeal_routes_1 = __importDefault(require("./appeal.routes"));
const prosecution_routes_1 = __importDefault(require("./prosecution.routes"));
// ==========================================
// 7. ANALYSE DE DONNÉES & ACCÈS PUBLIC
// ==========================================
const dashboard_routes_1 = __importDefault(require("./dashboard.routes"));
const stats_routes_1 = __importDefault(require("./stats.routes"));
const public_routes_1 = __importDefault(require("./public.routes"));
const resource_routes_1 = __importDefault(require("./resource.routes"));
const router = (0, express_1.Router)();
// ==========================================
// 🔗 MAPPAGE DES POINTS D'ENTRÉE (API)
// ==========================================
// --- Infrastructure ---
router.use("/auth", auth_routes_1.default);
router.use("/users", user_routes_1.default);
router.use("/audit-logs", audit_routes_1.default);
router.use("/admin", admin_routes_1.default);
router.use("/notifications", notification_routes_1.default);
router.use("/courts", court_routes_1.default);
router.use("/prisons", prison_routes_1.default);
router.use("/lawyers", lawyer_routes_1.default);
router.use("/bailiffs", bailiff_routes_1.default);
router.use("/citizens", citizen_routes_1.default);
// --- SIG & Sécurité ---
router.use("/police-stations", policeStation_routes_1.default);
router.use("/directory", policeStation_routes_1.default);
router.use("/sos", sos_routes_1.default);
// --- Dossiers Judiciaires ---
router.use("/complaints", complaint_routes_1.default);
router.use("/cases", case_routes_1.default);
router.use("/workflow", workflow_routes_1.default);
router.use("/assignments", assignment_routes_1.default);
router.use("/decisions", decision_routes_1.default);
router.use("/hearings", hearing_routes_1.default);
// --- Actes & Procédures ---
router.use("/summons", summon_routes_1.default);
router.use("/arrest-warrants", arrestWarrant_routes_1.default);
router.use("/search-warrants", searchWarrant_routes_1.default);
router.use("/witnesses", witness_routes_1.default);
router.use("/evidence", evidence_routes_1.default);
router.use("/attachments", attachment_routes_1.default);
router.use("/notes", note_routes_1.default);
// --- Pénitentiaire ---
router.use("/incarcerations", incarceration_routes_1.default);
router.use("/indictments", indictment_routes_1.default);
router.use("/custody-extensions", custodyExtension_routes_1.default);
router.use("/preventive-detentions", preventiveDetention_routes_1.default);
router.use("/releases", release_routes_1.default);
router.use("/sentences", sentence_routes_1.default);
router.use("/confiscations", confiscation_routes_1.default);
router.use("/custodies", custody_routes_1.default); // ⬅️ AJOUT : Route manquante !
// --- Voies de Recours ---
router.use("/reparations", reparation_routes_1.default);
router.use("/appeals", appeal_routes_1.default);
router.use("/prosecutions", prosecution_routes_1.default);
// --- Statistiques & Dashboards ---
router.use("/dashboard", dashboard_routes_1.default);
router.use("/stats", stats_routes_1.default);
router.use("/public", public_routes_1.default);
router.use("/resources", resource_routes_1.default);
// --- Surveillance du Système ---
router.get("/status", (_, res) => {
    res.json({
        success: true,
        message: "⚖️ Système National e-Justice Niger Online",
        version: "2.0.0",
        node_env: process.env.NODE_ENV || "development",
        timestamp: new Date()
    });
});
exports.default = router;
