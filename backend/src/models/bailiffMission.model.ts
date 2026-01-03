export interface BailiffMission {
  id: number;
  case_id: number;
  bailiff_id: number;
  document_url: string;
  status: 'A_SIGNIFIER' | 'SIGNIFIE' | 'ECHEC';
  latitude?: number;
  longitude?: number;
  executed_at?: Date;
  created_at: Date;
}