"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/interfaces/routes/index.ts
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const complaint_routes_1 = __importDefault(require("./complaint.routes"));
const case_routes_1 = __importDefault(require("./case.routes"));
const evidence_routes_1 = __importDefault(require("./evidence.routes"));
const assignment_routes_1 = __importDefault(require("./assignment.routes"));
const decision_routes_1 = __importDefault(require("./decision.routes"));
const hearing_routes_1 = __importDefault(require("./hearing.routes"));
const note_routes_1 = __importDefault(require("./note.routes"));
const log_routes_1 = __importDefault(require("./log.routes"));
const summon_routes_1 = __importDefault(require("./summon.routes"));
const indictment_routes_1 = __importDefault(require("./indictment.routes"));
// 🆕 Imports ajoutés pour les nouveaux modules
const searchWarrant_routes_1 = __importDefault(require("./searchWarrant.routes"));
const arrestWarrant_routes_1 = __importDefault(require("./arrestWarrant.routes"));
const custodyExtension_routes_1 = __importDefault(require("./custodyExtension.routes"));
const preventiveDetention_routes_1 = __importDefault(require("./preventiveDetention.routes"));
const confiscation_routes_1 = __importDefault(require("./confiscation.routes"));
const release_routes_1 = __importDefault(require("./release.routes"));
const reparation_routes_1 = __importDefault(require("./reparation.routes"));
const appeal_routes_1 = __importDefault(require("./appeal.routes"));
const prosecution_routes_1 = __importDefault(require("./prosecution.routes"));
const sentence_routes_1 = __importDefault(require("./sentence.routes"));
const witness_routes_1 = __importDefault(require("./witness.routes"));
const router = (0, express_1.Router)();
// Toutes les routes API listées proprement 👇
router.use("/auth", auth_routes_1.default);
router.use("/users", user_routes_1.default);
router.use("/complaints", complaint_routes_1.default);
router.use("/cases", case_routes_1.default);
router.use("/evidence", evidence_routes_1.default);
router.use("/assignments", assignment_routes_1.default);
router.use("/decisions", decision_routes_1.default);
router.use("/hearings", hearing_routes_1.default);
router.use("/notes", note_routes_1.default);
router.use("/logs", log_routes_1.default);
router.use("/summons", summon_routes_1.default);
router.use("/indictments", indictment_routes_1.default);
// 🆕 Ajout des nouvelles routes
router.use("/search-warrants", searchWarrant_routes_1.default);
router.use("/arrest-warrants", arrestWarrant_routes_1.default);
router.use("/custody-extensions", custodyExtension_routes_1.default);
router.use("/preventive-detentions", preventiveDetention_routes_1.default);
router.use("/confiscations", confiscation_routes_1.default);
router.use("/releases", release_routes_1.default);
router.use("/reparations", reparation_routes_1.default);
router.use("/appeals", appeal_routes_1.default);
router.use("/prosecutions", prosecution_routes_1.default);
router.use("/sentences", sentence_routes_1.default);
router.use("/witnesses", witness_routes_1.default);
exports.default = router;
