"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
// Routes
const auth_routes_1 = __importDefault(require("./interfaces/routes/auth.routes"));
const user_routes_1 = __importDefault(require("./interfaces/routes/user.routes"));
const complaint_routes_1 = __importDefault(require("./interfaces/routes/complaint.routes"));
const case_routes_1 = __importDefault(require("./interfaces/routes/case.routes"));
const assignment_routes_1 = __importDefault(require("./interfaces/routes/assignment.routes"));
const decision_routes_1 = __importDefault(require("./interfaces/routes/decision.routes"));
const attachment_routes_1 = __importDefault(require("./interfaces/routes/attachment.routes"));
const summon_routes_1 = __importDefault(require("./interfaces/routes/summon.routes")); // ✅ ajouté
const app = (0, express_1.default)();
// 🔐 Sécurité globale
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: "*" }));
app.use(express_1.default.json({ limit: "2mb" }));
app.use((0, morgan_1.default)("dev"));
// Public
app.use("/api/auth", auth_routes_1.default);
// 🔒 Routes protégées
app.use("/api/users", user_routes_1.default);
app.use("/api/complaints", complaint_routes_1.default);
app.use("/api/cases", case_routes_1.default);
app.use("/api/assignments", assignment_routes_1.default);
app.use("/api/decisions", decision_routes_1.default);
app.use("/api/attachments", attachment_routes_1.default);
app.use("/api/summons", summon_routes_1.default); // ✅ ajouté
app.get("/", (_req, res) => {
    res.json({ status: "Justice API Ready", version: "1.0" });
});
exports.default = app;
