"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const attachment_controller_1 = require("../controllers/attachment.controller");
const auth_middleware_1 = __importDefault(require("../../middleware/auth.middleware"));
const role_middleware_1 = require("../../middleware/role.middleware");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "judge"), attachment_controller_1.uploadAttachment);
router.get("/:caseId", auth_middleware_1.default, (0, role_middleware_1.requireRole)("police", "judge", "clerk"), attachment_controller_1.listAttachments);
router.delete("/:id", auth_middleware_1.default, (0, role_middleware_1.requireRole)("admin"), attachment_controller_1.deleteAttachment);
exports.default = router;
