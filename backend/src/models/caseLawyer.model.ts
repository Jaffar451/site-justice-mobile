export interface CaseLawyer {
  id: number;
  case_id: number;
  lawyer_id: number;
  side: 'DEFENSE' | 'PLAIGNANT';
  created_at: Date;
}