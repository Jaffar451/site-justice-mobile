import { ProceduralStep } from "../../models";

export const getProceduralDashboard = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "getProceduralDashboard prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const completeAct = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "completeAct prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const waiveAct = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "waiveAct prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
