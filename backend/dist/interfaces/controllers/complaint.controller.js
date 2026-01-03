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
exports.deleteComplaint = exports.updateComplaint = exports.createComplaint = exports.getComplaint = exports.listMyComplaints = exports.listComplaints = void 0;
// 👇 Import de ComplaintStatus nécessaire pour le typage strict
const complaint_model_1 = __importDefault(require("../../models/complaint.model"));
const log_model_1 = __importDefault(require("../../models/log.model"));
// 🔐 Log automatique
const audit = (req, action) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const method = req.method.toUpperCase();
        const endpoint = req.originalUrl || req.url || "unknown";
        yield log_model_1.default.create({
            userId: (_b = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id) !== null && _b !== void 0 ? _b : null,
            action,
            method,
            endpoint,
            ip: (_c = req.ip) !== null && _c !== void 0 ? _c : "0.0.0.0",
        });
    }
    catch (_d) { }
});
// LIST GLOBAL — Police / Juge / Admin
const listComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "LIST_COMPLAINTS");
        const items = yield complaint_model_1.default.findAll({
            // "as any" ici pour éviter les conflits si ComplaintStatus est une union string literal
            where: { status: ["pending", "processing"] },
            order: [["createdAt", "DESC"]],
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Error in listComplaints:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listComplaints = listComplaints;
// LIST MINE — Citizen Only
const listMyComplaints = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Non authentifié" });
        const userId = req.user.id;
        yield audit(req, "LIST_MY_COMPLAINTS");
        const items = yield complaint_model_1.default.findAll({
            where: { citizenId: userId },
            order: [["createdAt", "DESC"]],
        });
        return res.json(items);
    }
    catch (error) {
        console.error("Error in listMyComplaints:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.listMyComplaints = listMyComplaints;
// GET ONE
const getComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield audit(req, "GET_COMPLAINT");
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        const item = yield complaint_model_1.default.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Plainte introuvable" });
        if (user.role === "citizen" && item.citizenId !== user.id) {
            return res.status(403).json({ message: "Accès refusé" });
        }
        return res.json(item);
    }
    catch (error) {
        console.error("Error in getComplaint:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.getComplaint = getComplaint;
// CREATE Citizen Only
const createComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Non authentifié" });
        const userId = req.user.id;
        const { description, location, provisionalOffence } = req.body;
        if (!(description === null || description === void 0 ? void 0 : description.trim())) {
            return res.status(400).json({ message: "Description obligatoire" });
        }
        const item = yield complaint_model_1.default.create({
            citizenId: userId,
            description: description.trim(),
            status: "pending", // 👈 Typage strict vital ici
            filedAt: new Date(),
            location: location || null,
            provisionalOffence: provisionalOffence || null,
        });
        yield audit(req, `CREATE_COMPLAINT #${item.id}`);
        return res.status(201).json(item);
    }
    catch (error) {
        console.error("Error in createComplaint:", error);
        return res.status(500).json({ message: "Erreur serveur" });
    }
});
exports.createComplaint = createComplaint;
// UPDATE — Police / Greffe only
const updateComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield complaint_model_1.default.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Plainte introuvable" });
        const { description, status, provisionalOffence } = req.body;
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: "Non authentifié" });
        // --- TRANSITION VALIDATION LOGIC ---
        if (status && status !== item.status) {
            const currentStatus = item.status;
            const nextStatus = status;
            const role = user.role;
            // Utilisation de Record<string, ...> pour éviter l'indexation implicite 'any'
            const allowedTransitions = {
                police: {
                    pending: ["en_cours_OPJ"],
                    en_cours_OPJ: ["transmise_procur", "classée_sans_suite_par_OPJ"],
                },
                prosecutor: {
                    transmise_procur: [
                        "classée_sans_suite_par_procureur",
                        "instruction",
                        "poursuite",
                    ],
                },
                clerk: {
                // Placeholder for clerk-specific transitions
                },
            };
            // Cast du role en string pour être sûr
            const userTransitions = allowedTransitions[role];
            const validTransitions = (userTransitions === null || userTransitions === void 0 ? void 0 : userTransitions[currentStatus]) || [];
            // Si le statut est invalide, on peut bloquer.
            // Note : Je garde la logique permissive pour le moment si tu veux juste tester
            if (!validTransitions.includes(nextStatus)) {
                /*
                return res.status(403).json({
                  message: `Transition de statut non autorisée de '${currentStatus}' à '${nextStatus}' pour le rôle '${role}'.`,
                });
                */
            }
        }
        // --- END TRANSITION LOGIC ---
        yield item.update({
            description: description || item.description,
            status: status || item.status,
            provisionalOffence: provisionalOffence || item.provisionalOffence,
        });
        yield audit(req, `UPDATE_COMPLAINT #${item.id}`);
        return res.json(item);
    }
    catch (error) {
        console.error("Error in updateComplaint:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.updateComplaint = updateComplaint;
// DELETE — Admin only
const deleteComplaint = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const item = yield complaint_model_1.default.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ message: "Plainte introuvable" });
        yield item.destroy();
        yield audit(req, `DELETE_COMPLAINT #${item.id}`);
        return res.status(204).send();
    }
    catch (error) {
        console.error("Error in deleteComplaint:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.deleteComplaint = deleteComplaint;
