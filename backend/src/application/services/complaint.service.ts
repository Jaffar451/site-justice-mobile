import Complaint from "../../models/complaint.model";
import PoliceStation from "../../models/policeStation.model";

export class ComplaintService {
  async createComplaint(data: any, citizenId: number) {
    // 1. Trouver le commissariat correspondant au quartier (district) envoyé par le mobile
    const station = await PoliceStation.findOne({
      where: { district: data.district } // ex: "Goudel"
    });

    // 2. Créer la plainte avec le lien automatique
    return await Complaint.create({
      ...data,
      citizenId,
      policeStationId: station ? station.id : null, // On lie le dossier au quartier
      status: "soumise",
      filedAt: new Date()
    });
  }
}