"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// PATH: src/scripts/seed.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const bcrypt_1 = __importDefault(require("bcrypt"));
const database_1 = require("../config/database");
// 👇 Ajout de CaseStatus et CaseStage dans les imports
const user_model_1 = __importDefault(require("../models/user.model"));
const complaint_model_1 = __importDefault(require("../models/complaint.model"));
const case_model_1 = __importDefault(require("../models/case.model"));
const assignment_model_1 = __importDefault(require("../models/assignment.model"));
const summon_model_1 = __importDefault(require("../models/summon.model"));
const seed_data_1 = require("./seed-data");
const seedDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log("🌱 Début du seed de la base de données...\n");
        yield database_1.sequelize.authenticate();
        console.log("✅ Connexion à la base de données établie\n");
        console.log("🔄 Synchronisation des modèles... (ATTENTION: recrée les tables)");
        yield database_1.sequelize.sync({ force: true });
        console.log("✅ Modèles synchronisés\n");
        const transaction = yield database_1.sequelize.transaction();
        console.log("⏳ Démarrage de la transaction...");
        try {
            // 1. Utilisateurs
            console.log("👥 Création des utilisateurs...");
            const hashedPassword = yield bcrypt_1.default.hash(process.env.SEED_DEFAULT_PASSWORD || "password123", 10);
            const createdUsers = new Map();
            for (const userData of seed_data_1.usersData) {
                const [user] = yield user_model_1.default.findOrCreate({
                    where: { email: userData.email },
                    defaults: Object.assign(Object.assign({}, userData), { password: hashedPassword, role: userData.role }),
                    transaction,
                });
                createdUsers.set(userData.key, user);
            }
            console.log(`✅ ${createdUsers.size} utilisateurs créés\n`);
            // 2. Plaintes
            console.log("📝 Création des plaintes...");
            const createdComplaints = new Map();
            for (const complaintData of seed_data_1.complaintsData) {
                const [complaint] = yield complaint_model_1.default.findOrCreate({
                    where: { description: complaintData.description },
                    defaults: Object.assign(Object.assign({}, complaintData), { status: complaintData.status, citizenId: createdUsers.get(complaintData.citizenKey).id }),
                    transaction,
                });
                createdComplaints.set(complaintData.key, complaint);
            }
            console.log(`✅ ${createdComplaints.size} plaintes créées\n`);
            // 3. Dossiers (Cases) - C'est ici que ça bloquait !
            console.log("📁 Création des dossiers...");
            const createdCases = new Map();
            for (const caseData of seed_data_1.casesData) {
                const [caseModel] = yield case_model_1.default.findOrCreate({
                    where: { reference: caseData.reference },
                    defaults: Object.assign(Object.assign({}, caseData), { 
                        // 👇 CORRECTIONS IMPORTANTES ICI
                        type: caseData.type, status: caseData.status, stage: caseData.stage, complaintId: createdComplaints.get(caseData.complaintKey).id }),
                    transaction,
                });
                createdCases.set(caseData.reference, caseModel);
            }
            console.log(`✅ ${createdCases.size} dossiers créés\n`);
            // 4. Assignations
            console.log("👮 Création des assignations...");
            let assignmentsCount = 0;
            for (const assignmentData of seed_data_1.assignmentsData) {
                yield assignment_model_1.default.findOrCreate({
                    where: {
                        caseId: createdCases.get(assignmentData.caseRef).id,
                        userId: createdUsers.get(assignmentData.userKey).id,
                    },
                    defaults: Object.assign(Object.assign({}, assignmentData), { role: assignmentData.role, caseId: createdCases.get(assignmentData.caseRef).id, userId: createdUsers.get(assignmentData.userKey).id }),
                    transaction,
                });
                assignmentsCount++;
            }
            console.log(`✅ ${assignmentsCount} assignations créées\n`);
            // 5. Convocations
            console.log("📨 Création des convocations...");
            let summonsCount = 0;
            for (const summonData of seed_data_1.summonsData) {
                yield summon_model_1.default.findOrCreate({
                    where: {
                        complaintId: createdComplaints.get(summonData.complaintKey).id,
                        targetName: summonData.targetName,
                    },
                    defaults: Object.assign(Object.assign({}, summonData), { status: summonData.status, complaintId: createdComplaints.get(summonData.complaintKey).id, issuedBy: createdUsers.get(summonData.issuerKey).id }),
                    transaction,
                });
                summonsCount++;
            }
            console.log(`✅ ${summonsCount} convocations créées\n`);
            yield transaction.commit();
            console.log("✅ Transaction validée.");
            console.log("\n🎉 Seed terminé avec succès !");
        }
        catch (error) {
            console.error("\n❌ Erreur détectée. Rollback...");
            yield transaction.rollback();
            throw error;
        }
    }
    catch (error) {
        console.error("\n❌ Erreur critique:", error);
        throw error;
    }
});
seedDatabase()
    .then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\nDéconnexion...");
    yield database_1.sequelize.close();
    process.exit(0);
}))
    .catch(() => __awaiter(void 0, void 0, void 0, function* () {
    console.error("\n❌ Échec du seed.");
    yield database_1.sequelize.close();
    process.exit(1);
}));
