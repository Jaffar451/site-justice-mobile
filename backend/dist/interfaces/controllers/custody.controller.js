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
exports.deleteCustody = exports.updateCustody = exports.getCustody = exports.getAllCustodies = exports.createCustody = void 0;
const custody_model_1 = __importDefault(require("../../models/custody.model"));
const createCustody = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const custody = yield custody_model_1.default.create(req.body);
        return res.status(201).json(custody);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur création", error: err });
    }
});
exports.createCustody = createCustody;
const getAllCustodies = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const custodies = yield custody_model_1.default.findAll();
        return res.json(custodies);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur récupération", error: err });
    }
});
exports.getAllCustodies = getAllCustodies;
const getCustody = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const custody = yield custody_model_1.default.findByPk(req.params.id);
        if (!custody)
            return res.status(404).json({ message: "Non trouvée" });
        return res.json(custody);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur", error: err });
    }
});
exports.getCustody = getCustody;
const updateCustody = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const custody = yield custody_model_1.default.findByPk(req.params.id);
        if (!custody)
            return res.status(404).json({ message: "Non trouvée" });
        yield custody.update(req.body);
        return res.json(custody);
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur MAJ", error: err });
    }
});
exports.updateCustody = updateCustody;
const deleteCustody = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const custody = yield custody_model_1.default.findByPk(req.params.id);
        if (!custody)
            return res.status(404).json({ message: "Non trouvée" });
        yield custody.destroy();
        return res.json({ message: "Supprimée" });
    }
    catch (err) {
        return res.status(500).json({ message: "Erreur suppression", error: err });
    }
});
exports.deleteCustody = deleteCustody;
