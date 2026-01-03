"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
// PATH: src/schemas/auth.schema.ts
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    firstname: zod_1.z.string().min(2, "Prénom trop court"),
    lastname: zod_1.z.string().min(2, "Nom trop court"),
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(6, "Mot de passe trop court"),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Email invalide"),
    password: zod_1.z.string().min(1, "Mot de passe requis"),
});
