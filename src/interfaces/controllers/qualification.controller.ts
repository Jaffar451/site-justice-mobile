import { CaseQualification } from "../../models";

export const getQualification = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "getQualification prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const qualifyCase = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "qualifyCase prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getQualificationHistory = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "getQualificationHistory prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
