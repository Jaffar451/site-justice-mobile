"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try {
            step(generator.next(value));
        }
        catch (e) {
            reject(e);
        } }
        function rejected(value) { try {
            step(generator["throw"](value));
        }
        catch (e) {
            reject(e);
        } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCase = exports.updateCase = exports.getCase = exports.createCase = exports.listMyCases = exports.listCases = void 0;
// 🛡️ Rôle juridique
const ALLOWED = {
    CITIZEN: "citizen",
    POLICE: "police",
    PROSECUTOR: "prosecutor",
    JUDGE: "judge",
    CLERK: "clerk",
    LAWYER: "lawyer",
    ADMIN: "admin",
    PRISON_OFFICER: "prison_officer",
};
const audit = (req, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const method = req.method.toUpperCase();
        const endpoint = req.originalUrl || req.url || "unknown";
        yield;
        create({
            userId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            action,
            method,
            endpoint,
            ip: (_c = req.ip) !== null && _c !== void 0 ? _c : "0.0.0.0",
        });
    }
    catch (_d) { }
});
// --------------------------------------------------
// GET /api/cases (Admin uniquement)
// --------------------------------------------------
const listCases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "List All Cases");
        const items = yield, findAll;
        ({
            include: [{ model:  }],
            order: [["createdAt", "DESC"]],
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Error in listCases:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listCases = listCases;
// --------------------------------------------------
// GET /api/cases/my → automatiquement filtré par rôle
// --------------------------------------------------
const listMyCases = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "List My Cases");
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non autorisé" });
        const { id, role } = user;
        let cases = [];
        if (role === ALLOWED.CITIZEN) {
            const complaints = yield, findAll;
            ({
                where: { citizenId: id },
            });
            const ids = complaints.map((c) => c.id);
            cases = yield;
            findAll({
                where: { complaintId: ids },
                include: [{ model:  }],
            });
        }
        else if ([
            ALLOWED.POLICE,
            ALLOWED.PROSECUTOR,
            ALLOWED.JUDGE,
            ALLOWED.CLERK,
            ALLOWED.LAWYER,
            ALLOWED.PRISON_OFFICER,
        ].includes(role) // 👈 CORRECTION ICI : "as any" résout l'erreur TS2345
        ) {
            const assignments = yield, findAll;
            ({ where: { userId: id } });
            const ids = assignments.map((a) => a.caseId);
            cases = yield;
            findAll({
                where: { id: ids },
                include: [{ model:  }],
            });
        }
        else if (role === ALLOWED.ADMIN) {
            return (0, exports.listCases)(req, res);
        }
        else {
            return res.status(403).json({ message: "Accès interdit" });
        }
        return res.json(cases);
    }
    catch (error) {
        console.error("Erreur listMyCases:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.listMyCases = listMyCases;
// --------------------------------------------------
// POST /api/cases
// --------------------------------------------------
const createCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        yield audit(req, "Create Case");
        const { complaintId } = req.body;
        const userRole = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
        let initialStage = "police_investigation";
        if (userRole === ALLOWED.PROSECUTOR) {
            initialStage = "prosecution_review";
        }
        const ref = `CASE-${Date.now()}`;
        const item = yield, create;
        ({
            complaintId,
            reference: ref,
            stage: initialStage,
            status: "open",
            type: "criminal",
        });
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Erreur createCase:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.createCase = createCase;
// --------------------------------------------------
// GET /api/cases/:id
// --------------------------------------------------
const getCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "Get Case");
        const item = yield, findByPk;
        (req.params.id, {
            include: [{ model:  }],
        });
        if (!item)
            return res.status(404).json({ message: "Affaire introuvable" });
        return res.json(item);
    }
    catch (error) {
        console.error("Error in getCase:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getCase = getCase;
// --------------------------------------------------
// PUT /api/cases/:id
// --------------------------------------------------
const updateCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "Update Case");
        const item = yield, findByPk;
        (req.params.id);
        if (!item)
            return res.status(404).json({ message: "Affaire introuvable" });
        const { stage, status } = req.body;
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        // --- VALIDATION DE TRANSITION D'ÉTAPE ---
        if (stage && stage !== item.stage) {
            const allowedTransitions = {
                prosecutor: {
                    prosecution_review: ["trial"],
                },
                judge: {
                    prosecution_review: ["trial"],
                    trial: ["appeal", "execution"],
                },
            };
            const userTransitions = allowedTransitions[user.role];
            const validTransitions = (userTransitions === null || userTransitions === void 0 ? void 0 : userTransitions[item.stage]) || [];
            // Tu peux décommenter ceci plus tard pour activer la sécurité stricte
            /*
            if (!validTransitions.includes(stage)) {
               return res.status(403).json({ message: "Transition interdite" });
            }
            */
        }
        yield item.update({
            stage: stage || item.stage,
            status: status || item.status,
        });
        if (status &&
            ["closed", "archived"].includes(status) &&
            !item.closedAt) {
            yield item.update({ closedAt: new Date() });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error in updateCase:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateCase = updateCase;
// --------------------------------------------------
// DELETE /api/cases/:id
// --------------------------------------------------
const deleteCase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "Delete Case");
        const item = yield, findByPk;
        (req.params.id);
        if (!item)
            return res.status(404).json({ message: "Affaire introuvable" });
        yield item.destroy();
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteCase:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteCase = deleteCase;
