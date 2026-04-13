"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = notFound;
function notFound(_req, res) {
    res.status(404).json({ message: "Route introuvable" });
}
