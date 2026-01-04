// @ts-nocheck
import { Request, Response } from "express";
import Warrant from "../../models/warrant.model";

export const createWarrant = async (req: Request, res: Response) => {
try {
const warrant = await Warrant.create(req.body);
return res.status(201).json(warrant);
} catch (error) {
return res.status(500).json({ message: "Erreur lors de la création", error });
}
};


export const getWarrant = async (req: Request, res: Response) => {
try {
const warrant = await Warrant.findByPk(req.params.id);
if (!warrant) return res.status(404).json({ message: "Non trouvé" });
return res.json(warrant);
} catch (error) {
return res.status(500).json({ message: "Erreur de récupération", error });
}
};


export const updateWarrant = async (req: Request, res: Response) => {
try {
const [updated] = await Warrant.update(req.body, { where: { id: req.params.id } });
if (!updated) return res.status(404).json({ message: "Non trouvé" });
const updatedRecord = await Warrant.findByPk(req.params.id);
return res.json(updatedRecord);
} catch (error) {
return res.status(500).json({ message: "Erreur de mise à jour", error });
}
};


export const deleteWarrant = async (req: Request, res: Response) => {
try {
const deleted = await Warrant.destroy({ where: { id: req.params.id } });
if (!deleted) return res.status(404).json({ message: "Non trouvé" });
return res.json({ message: "Supprimé avec succès" });
} catch (error) {
return res.status(500).json({ message: "Erreur de suppression", error });
}
};