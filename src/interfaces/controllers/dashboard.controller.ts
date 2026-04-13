import Complaint from "../../models/complaint.model";
import User from "../../models/user.model";

export const getPrisonStats = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "getPrisonStats prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};

export const getPoliceStats = async (req: any, res: any) => {
  try {
    res.status(200).json({ message: "getPoliceStats prêt" });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur" });
  }
};
