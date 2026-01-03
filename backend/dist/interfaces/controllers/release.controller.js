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
exports.getReleases = exports.createRelease = void 0;
const release_model_1 = __importDefault(require("../../models/release.model"));
const createRelease = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const record = yield release_model_1.default.create(req.body);
        res.status(201).json(record);
    }
    catch (error) {
        res.status(500).json({ error });
    }
});
exports.createRelease = createRelease;
const getReleases = (_, res) => __awaiter(void 0, void 0, void 0, function* () {
    const records = yield release_model_1.default.findAll();
    res.json(records);
});
exports.getReleases = getReleases;
