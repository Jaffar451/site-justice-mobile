import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import User from "../../models/user.model";
import RefreshToken from "../../models/refreshToken.model";
import { registerSchema, loginSchema } from "../../schemas/auth.schema";
import { env } from "../../config/env";

type LoginInput = z.infer<typeof loginSchema>;

const { secret: JWT_SECRET, refreshSecret: REFRESH_SECRET, expiration: JWT_EXPIRES_IN, refreshExpiration: REFRESH_EXPIRES_IN } = env.jwt;

const signToken = (user: any) => jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
const signRefresh = (user: any) => jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN as any });
const publicUser = (u: any) => ({ id: u.id, firstname: u.firstname, lastname: u.lastname, email: u.email, role: u.role.toLowerCase() });

export const register = async (req: Request, res: Response) => {
  try {
    const body = registerSchema.parse(req.body);
    const exists = await User.findOne({ where: { email: body.email } });
    if (exists) return res.status(409).json({ message: "Email déjà utilisé" });
    const hashedPass = await bcrypt.hash(body.password, 10);
    const user = await User.create({ ...body, password: hashedPass, role: "citizen" });
    return res.status(201).json(publicUser(user));
  } catch (error) {
    return res.status(400).json({ message: "Données d'inscription invalides" });
  }
};

export const login = async (req: Request, res: Response) => {
  const LOCK_DURATION_MIN = 15;
  const MAX_ATTEMPTS = 5;
  try {
    const body: LoginInput = loginSchema.parse(req.body);

    const user = (await User.findOne({
      where: { [Op.or]: [{ email: body.identifier }, { matricule: body.identifier }] },
    })) as any;

    if (!user) return res.status(401).json({ message: "Identifiants invalides" });
    if (user.lockUntil && user.lockUntil > new Date()) return res.status(403).json({ message: "Compte verrouillé." });

    const ok = await bcrypt.compare(body.password, user.password);
    if (!ok) {
      user.failedAttempts = (user.failedAttempts || 0) + 1;
      if (user.failedAttempts >= MAX_ATTEMPTS) user.lockUntil = new Date(Date.now() + LOCK_DURATION_MIN * 60 * 1000);
      await user.save();
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    user.failedAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const token = signToken(user);
    const refresh = signRefresh(user);

    // CORRECTION : Calcul de la date d'expiration pour éviter l'erreur notNull Violation
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7); // Expiration dans 7 jours

    await RefreshToken.destroy({ where: { userId: user.id } });
    await RefreshToken.create({ 
      userId: user.id, 
      token: refresh,
      expiryDate: expiryDate // Ajout de la date obligatoire
    });

    return res.json({ token, refresh, user: publicUser(user) });
  } catch (err) {
    console.error("Erreur login:", err);
    return res.status(400).json({ message: "Requête invalide" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(400).json({ message: "Token requis" });
    await RefreshToken.destroy({ where: { token: refresh } });
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refresh } = req.body;
    if (!refresh) return res.status(401).json({ message: "Token manquant" });
    const decoded: any = jwt.verify(refresh, REFRESH_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ message: "Invalid refresh" });
    return res.json({ token: signToken(user) });
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};

export const me = async (req: Request, res: Response) => {
  // @ts-ignore
  if (req.user) return res.json(publicUser(req.user));
  return res.status(401).json({ message: "Non authentifié" });
};

export const createSuperAdmin = async (req: Request, res: Response) => {
  return res.status(501).json({ message: "Non implémenté" });
};