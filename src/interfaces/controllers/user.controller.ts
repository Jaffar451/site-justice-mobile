// @ts-nocheck
// PATH: src/interfaces/controllers/user.controller.ts
import { Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/user.model";
import { CustomRequest } from "../../types/express-request";
import { env } from "../../config/env";
import PoliceStation from "../../models/policeStation.model";
import Court from "../../models/court.model";
import Prison from "../../models/prison.model";

const USER_QUERY_OPTIONS = {
  attributes: { exclude: ["password"] },
  include: [
    { model: PoliceStation, as: "station", attributes: ["id", "name", "city"] },
    { model: Court, as: "court", attributes: ["id", "name", "city"] },
    { model: Prison, as: "prison", attributes: ["id", "name", "city"] },
  ],
};

// --- 📋 LISTE ---
export const listUsers = async (_req: CustomRequest, res: Response) => {
  try {
    const users = await User.findAll(USER_QUERY_OPTIONS);
    return res.json({ success: true, data: users });
  } catch (error) {
    return res.status(500).json({ message: "Erreur lors de la récupération" });
  }
};

// --- 👤 PROFIL (ME) ---
export const getMe = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });
    const user = await User.findByPk(req.user.id, USER_QUERY_OPTIONS);
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- 🛠️ MISE À JOUR PROFIL (UPDATE ME) ---
// ✅ Correction : S'assurer que cette fonction est bien exportée
export const updateMe = async (req: CustomRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Non authentifié" });
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const { firstname, lastname, telephone, password } = req.body;
    const updates: any = {};

    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;
    if (telephone) updates.telephone = telephone;
    if (password && password.trim() !== "") {
      updates.password = await bcrypt.hash(password, 10);
    }

    await user.update(updates);
    const out = await User.findByPk(user.id, USER_QUERY_OPTIONS);
    return res.json({ success: true, data: out });
  } catch (error) {
    return res.status(500).json({ message: "Erreur mise à jour profil" });
  }
};

// --- 🚀 CRÉATION (ADMIN) ---
export const createUser = async (req: CustomRequest, res: Response) => {
  try {
    const { email, password, role, firstname, lastname } = req.body;
    if (!email || !password || !role) return res.status(400).json({ message: "Champs manquants" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hash, isActive: true });
    
    const out = await User.findByPk(user.id, USER_QUERY_OPTIONS);
    return res.status(201).json({ success: true, data: out });
  } catch (error) {
    return res.status(500).json({ message: "Erreur création" });
  }
};

// --- 🔍 VOIR UN UTILISATEUR (GET USER) ---
// ✅ Correction : Ajout de l'export manquant
export const getUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id, USER_QUERY_OPTIONS);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- 🔄 MODIFIER ---
export const updateUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    if (req.body.password) req.body.password = await bcrypt.hash(req.body.password, 10);
    
    await user.update(req.body);
    const out = await User.findByPk(user.id, USER_QUERY_OPTIONS);
    return res.json({ success: true, data: out });
  } catch (error) {
    return res.status(500).json({ message: "Erreur mise à jour" });
  }
};

// --- 🗑️ SUPPRIMER ---
export const deleteUser = async (req: CustomRequest, res: Response) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: "Erreur suppression" });
  }
};