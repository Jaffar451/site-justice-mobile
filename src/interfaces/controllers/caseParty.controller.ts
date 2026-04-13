import { CaseParty } from "../../models";

export const getParties = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "getParties prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const addParty = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "addParty prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const removeParty = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "removeParty prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
