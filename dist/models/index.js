"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lawyer = exports.CaseProceduralAct = exports.ProceduralStep = exports.ProceduralTemplate = exports.QualificationHistory = exports.CaseQualification = exports.CaseParty = exports.ProfessionalProfile = exports.OffenseCircumstance = exports.Offense = exports.OffenseCategory = exports.Person = exports.Archive = exports.ProcesVerbal = exports.Witness = exports.Warrant = exports.SearchWarrant = exports.Sentence = exports.Reparation = exports.Release = exports.Prosecution = exports.PreventiveDetention = exports.Interrogation = exports.Detention = exports.CustodyExtension = exports.Custody = exports.Confiscation = exports.ArrestWarrant = exports.Appeal = exports.Indictment = exports.Summon = exports.RefreshToken = exports.Note = exports.AuditLog = exports.Hearing = exports.Evidence = exports.Attachment = exports.Decision = exports.Assignment = exports.CaseModel = exports.Complaint = exports.SosAlert = exports.ComplaintFile = exports.Incarceration = exports.Detainee = exports.Prison = exports.Court = exports.PoliceStation = exports.User = exports.sequelize = void 0;
exports.LegalText = void 0;
// PATH: src/models/index.ts
const sequelize_typescript_1 = require("sequelize-typescript");
// 1. IMPORTS DES MODÈLES
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
const policeStation_model_1 = __importDefault(require("./policeStation.model"));
exports.PoliceStation = policeStation_model_1.default;
const court_model_1 = __importDefault(require("./court.model"));
exports.Court = court_model_1.default;
const prison_model_1 = __importDefault(require("./prison.model"));
exports.Prison = prison_model_1.default;
const refreshToken_model_1 = __importDefault(require("./refreshToken.model"));
exports.RefreshToken = refreshToken_model_1.default;
const auditLog_model_1 = __importDefault(require("./auditLog.model"));
exports.AuditLog = auditLog_model_1.default;
// Workflow Judiciaire
const complaint_model_1 = __importDefault(require("./complaint.model"));
exports.Complaint = complaint_model_1.default;
const complaintFile_model_1 = __importDefault(require("./complaintFile.model"));
exports.ComplaintFile = complaintFile_model_1.default;
const case_model_1 = __importDefault(require("./case.model"));
exports.CaseModel = case_model_1.default;
const assignment_model_1 = __importDefault(require("./assignment.model"));
exports.Assignment = assignment_model_1.default;
const decision_model_1 = __importDefault(require("./decision.model"));
exports.Decision = decision_model_1.default;
const attachment_model_1 = __importDefault(require("./attachment.model"));
exports.Attachment = attachment_model_1.default;
const evidence_model_1 = __importDefault(require("./evidence.model"));
exports.Evidence = evidence_model_1.default;
const hearing_model_1 = __importDefault(require("./hearing.model"));
exports.Hearing = hearing_model_1.default;
const note_model_1 = __importDefault(require("./note.model"));
exports.Note = note_model_1.default;
const indictment_model_1 = __importDefault(require("./indictment.model"));
exports.Indictment = indictment_model_1.default;
const procesVerbal_model_1 = __importDefault(require("./procesVerbal.model"));
exports.ProcesVerbal = procesVerbal_model_1.default;
const archive_model_1 = __importDefault(require("./archive.model"));
exports.Archive = archive_model_1.default;
const person_model_1 = __importDefault(require("./person.model"));
exports.Person = person_model_1.default;
const offenseCategory_model_1 = __importDefault(require("./offenseCategory.model"));
exports.OffenseCategory = offenseCategory_model_1.default;
const offense_model_1 = __importDefault(require("./offense.model"));
exports.Offense = offense_model_1.default;
// Milieu Carcéral
const detainee_model_1 = __importDefault(require("./detainee.model"));
exports.Detainee = detainee_model_1.default;
const incarceration_model_1 = __importDefault(require("./incarceration.model"));
exports.Incarceration = incarceration_model_1.default;
// Procédures & Alertes
const sosAlert_model_1 = __importDefault(require("./sosAlert.model"));
exports.SosAlert = sosAlert_model_1.default;
const appeal_model_1 = __importDefault(require("./appeal.model"));
exports.Appeal = appeal_model_1.default;
const arrestWarrant_model_1 = __importDefault(require("./arrestWarrant.model"));
exports.ArrestWarrant = arrestWarrant_model_1.default;
const confiscation_model_1 = __importDefault(require("./confiscation.model"));
exports.Confiscation = confiscation_model_1.default;
const custody_model_1 = __importDefault(require("./custody.model"));
exports.Custody = custody_model_1.default;
const custodyExtension_model_1 = __importDefault(require("./custodyExtension.model"));
exports.CustodyExtension = custodyExtension_model_1.default;
const detention_model_1 = __importDefault(require("./detention.model"));
exports.Detention = detention_model_1.default;
const interrogation_model_1 = __importDefault(require("./interrogation.model"));
exports.Interrogation = interrogation_model_1.default;
const preventiveDetention_model_1 = __importDefault(require("./preventiveDetention.model"));
exports.PreventiveDetention = preventiveDetention_model_1.default;
const prosecution_model_1 = __importDefault(require("./prosecution.model"));
exports.Prosecution = prosecution_model_1.default;
const release_model_1 = __importDefault(require("./release.model"));
exports.Release = release_model_1.default;
const reparation_model_1 = __importDefault(require("./reparation.model"));
exports.Reparation = reparation_model_1.default;
const sentence_model_1 = __importDefault(require("./sentence.model"));
exports.Sentence = sentence_model_1.default;
const searchWarrant_model_1 = __importDefault(require("./searchWarrant.model"));
exports.SearchWarrant = searchWarrant_model_1.default;
const warrant_model_1 = __importDefault(require("./warrant.model"));
exports.Warrant = warrant_model_1.default;
const witness_model_1 = __importDefault(require("./witness.model"));
exports.Witness = witness_model_1.default;
const summon_model_1 = __importDefault(require("./summon.model"));
exports.Summon = summon_model_1.default;
// ✅ AJOUT : Ressources Juridiques (Annuaire & Lois)
const lawyer_model_1 = require("./lawyer.model");
Object.defineProperty(exports, "Lawyer", { enumerable: true, get: function () { return lawyer_model_1.Lawyer; } });
const legalText_model_1 = require("./legalText.model");
Object.defineProperty(exports, "LegalText", { enumerable: true, get: function () { return legalText_model_1.LegalText; } });
const offenseCircumstance_model_1 = __importDefault(require("./offenseCircumstance.model"));
exports.OffenseCircumstance = offenseCircumstance_model_1.default;
const professionnalProfile_model_1 = __importDefault(require("./professionnalProfile.model"));
exports.ProfessionalProfile = professionnalProfile_model_1.default;
const caseParty_model_1 = __importDefault(require("./caseParty.model"));
exports.CaseParty = caseParty_model_1.default;
const caseQualification_model_1 = __importDefault(require("./caseQualification.model"));
exports.CaseQualification = caseQualification_model_1.default;
const qualificationHistory_model_1 = __importDefault(require("./qualificationHistory.model"));
exports.QualificationHistory = qualificationHistory_model_1.default;
const proceduralTemplate_model_1 = __importDefault(require("./proceduralTemplate.model"));
exports.ProceduralTemplate = proceduralTemplate_model_1.default;
const proceduralStep_model_1 = __importDefault(require("./proceduralStep.model"));
exports.ProceduralStep = proceduralStep_model_1.default;
const caseProceduralAct_model_1 = __importDefault(require("./caseProceduralAct.model"));
exports.CaseProceduralAct = caseProceduralAct_model_1.default;
// 2. CONFIGURATION DB (Modifiée pour Render)
const env = process.env.NODE_ENV || 'development';
// On essaie de charger le fichier json, mais on ne plante pas s'il est absent
let config = { database: '', username: '', password: '', host: '', dialect: '' };
try {
    config = require('../config/config.json')[env];
}
catch (error) {
    // Le fichier n'existe pas, on utilisera les variables d'environnement
}
// 👉 PRIORITÉ AUX VARIABLES RENDER (DB_HOST, etc.)
const dbName = process.env.DB_NAME || config.database;
const dbUser = process.env.DB_USER || config.username;
const dbPassword = process.env.DB_PASSWORD || config.password;
const dbHost = process.env.DB_HOST || config.host || '127.0.0.1';
const dbPort = process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432;
console.log(`📡 Connexion Sequelize vers : ${dbHost} (Base: ${dbName})`);
const sequelize = new sequelize_typescript_1.Sequelize({
    database: dbName,
    username: dbUser,
    password: dbPassword,
    host: dbHost,
    port: dbPort,
    dialect: 'postgres',
    logging: false,
    // 🔐 Configuration SSL obligatoire pour Render
    dialectOptions: process.env.DB_SSL === 'true' ? {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    } : {
        ssl: false
    },
    models: [
        user_model_1.default, policeStation_model_1.default, court_model_1.default, prison_model_1.default, refreshToken_model_1.default, auditLog_model_1.default,
        complaint_model_1.default, complaintFile_model_1.default, case_model_1.default, assignment_model_1.default, decision_model_1.default, attachment_model_1.default,
        evidence_model_1.default, hearing_model_1.default, note_model_1.default, indictment_model_1.default, procesVerbal_model_1.default, archive_model_1.default,
        detainee_model_1.default, incarceration_model_1.default, sosAlert_model_1.default, appeal_model_1.default, arrestWarrant_model_1.default, confiscation_model_1.default,
        custody_model_1.default, custodyExtension_model_1.default, detention_model_1.default, interrogation_model_1.default, preventiveDetention_model_1.default,
        prosecution_model_1.default, release_model_1.default, reparation_model_1.default, sentence_model_1.default, searchWarrant_model_1.default, warrant_model_1.default,
        witness_model_1.default, summon_model_1.default, person_model_1.default, offenseCategory_model_1.default, offense_model_1.default, offenseCircumstance_model_1.default, professionnalProfile_model_1.default, caseParty_model_1.default, caseQualification_model_1.default, qualificationHistory_model_1.default, proceduralTemplate_model_1.default, proceduralStep_model_1.default, caseProceduralAct_model_1.default,
        // ✅ AJOUT DANS LA LISTE
        lawyer_model_1.Lawyer, legalText_model_1.LegalText
    ],
});
exports.sequelize = sequelize;
