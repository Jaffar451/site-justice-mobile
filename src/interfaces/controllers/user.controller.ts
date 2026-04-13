import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../../models/user.model";
import PoliceStation from "../../models/policeStation.model";
import { env } from "../../config/env";

const PUBLIC_FIELDS = {
  attributes: { exclude: ["password"] as string[] },
  include: [{ model: PoliceStation, as: "station" }] 
};

const BCRYPT_ROUNDS = (env as any).security?.bcryptRounds || 10;

const getId = (id: string | string[]): string => (Array.isArray(id) ? id[0] : id);

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: PUBLIC_FIELDS.attributes,
      include: [{ model: PoliceStation, as: "station" }]
    });
    return res.json({ success: true, data: users });
  } catch (error) {
    console.error("Error in listUsers:", error);
    return res.status(500).json({ message: "Erreur serveur lors de la récupération des utilisateurs" });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userReq = req as any;
    if (!userReq.user) return res.status(401).json({ message: "Non authentifié" });

    const user = await User.findByPk(userReq.user.id, {
      attributes: PUBLIC_FIELDS.attributes,
      include: [{ model: PoliceStation, as: "station" }]
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getMe:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateMe = async (req: Request, res: Response) => {
  try {
    const userReq = req as any;
    if (!userReq.user) return res.status(401).json({ message: "Non authentifié" });

    const user = await User.findByPk(userReq.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    const { firstname, lastname, password } = req.body;
    const updates: any = {};
    if (firstname) updates.firstname = firstname;
    if (lastname) updates.lastname = lastname;
    if (password) updates.password = await bcrypt.hash(password, BCRYPT_ROUNDS);

    await user.update(updates);
    const updatedUser = await User.findByPk(user.id, PUBLIC_FIELDS);
    return res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error in updateMe:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstname, lastname, email, password, role, matricule, poste, policeStationId } = req.body;
    
    if (!firstname || !lastname || !email || !password) {
      return res.status(400).json({ message: "Champs requis manquants" });
    }

    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ message: "Email déjà utilisé" });

    const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hash,
      role: role?.toLowerCase() || "citizen",
      matricule: matricule || null,
      organization: poste || null,
      policeStationId: policeStationId || null
    });

    const out = await User.findByPk(user.id, PUBLIC_FIELDS);
    return res.status(201).json({ success: true, data: out });
  } catch (error) {
    console.error("Error in createUser:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(getId(req.params.id), PUBLIC_FIELDS);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error("Error in getUser:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(getId(req.params.id));
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const { firstname, lastname, role, matricule, poste, policeStationId } = req.body;
    await user.update({
      firstname,
      lastname,
      role: role?.toLowerCase(),
      matricule,
      organization: poste,
      policeStationId
    });

    const out = await User.findByPk(user.id, PUBLIC_FIELDS);
    return res.json({ success: true, data: out });
  } catch (error) {
    console.error("Error in updateUser:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByPk(getId(req.params.id));
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    await user.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export const updatePushToken = async (req: Request, res: Response) => {
  try {
    const userReq = req as any;
    if (!userReq.user) return res.status(401).json({ message: "Non authentifié" });

    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "Token requis" });

    const user = await User.findByPk(userReq.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur introuvable" });

    await user.update({ pushToken: token });
    return res.json({ success: true, message: "Token mis à jour" });
  } catch (error) {
    console.error("Error in updatePushToken:", error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
};