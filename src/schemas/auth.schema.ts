// PATH: src/schemas/auth.schema.ts
import { z } from "zod";

export const registerSchema = z.object({
  firstname: z.string().min(2, "Prénom trop court"),
  lastname: z.string().min(2, "Nom trop court"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court"),
});

export const loginSchema = z.object({
  // On change 'email' par 'identifier' pour accepter matricule ou email
  identifier: z.string().min(1, "Identifiant requis"),
  password: z.string().min(1, "Mot de passe requis"),
});