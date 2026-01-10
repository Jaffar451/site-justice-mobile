import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Complaint } from "../services/complaint.service";

/**
 * 🔐 AUTH STACK
 */
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * 🌍 ROOT STACK (Liste complète et synchronisée)
 */
export type RootStackParamList = {
  // --- Auth ---
  Auth: NavigatorScreenParams<AuthStackParamList>;

  // ✅ REDIRECTIONS VERS LES NAVIGATEURS DE RÔLES (Stacks parents)
  Main: undefined; 
  AdminStack: undefined;
  PoliceStack: undefined;
  JudgeStack: undefined;
  ProsecutorStack: undefined;
  CitizenStack: undefined;
  ClerkStack: undefined;
  CommissaireStack: undefined;
  LawyerStack: undefined;
  BailiffStack: undefined;
  PrisonStack: undefined;

  // --- Shared (Accessibles par tous) ---
  Profile: undefined;
  EditProfile: undefined; 
  Settings: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  About: undefined;
  UserGuide: undefined;
  Support: undefined;
  MyDownloads: undefined; 
  
  // Écrans de détails partagés
  ComplaintDetail: { id: string | number };
  ComplaintList: { id: string; complaintId: number };
  PoliceStation: undefined;

  // --- 👨‍💼 ADMIN ---
  AdminHome: undefined;
  AdminStats: undefined;
  AdminLogs: undefined;
  
  // Gestion Utilisateurs
  AdminUsers: undefined;
  AdminCreateUser: undefined;
  AdminEditUser: { userId: number };
  AdminUserDetails: { userId: number };
  AdminEditProfile: undefined;
  AdminSecurity: undefined;
  AdminMaintenance: undefined;
  AdminAuditTrail: undefined;
  AdminSecurityDashboard: undefined;

  // Gestion Juridictions & Unités
  AdminCourts: undefined;
  AdminCreateCourt: undefined;
  ManageStations: undefined;
  NationalMap: undefined;
  AdminSettings: undefined;
  AdminNotifications: undefined;

  // --- 👮 POLICE ---
  CreateSummon: { complaintId: number | string };
  PoliceHome: undefined;
  PoliceSearchWarrant: undefined;
  PoliceComplaints: undefined;
  PoliceCases: undefined;
  PolicePVScreen: { complaintId?: number };
  PoliceCustody: { complaintId: number; suspectName: string };
  PoliceArrestWarrant: undefined;
  PoliceDetention: { complaintId?: number ; suspectName: string };
  PoliceInterrogation: { complaintId: number; suspectName: string };
  WarrantSearch: undefined;
  PoliceCustodyExtension: { caseId: number; suspectName: string ; complaintId: number };
  SosDetail: { alert: any };
  PoliceComplaintDetails: { complaintId: number };

  // --- ⚖️ PROCUREUR ---
  ProsecutorHome: undefined;
  ProsecutorDashboard: undefined;
  ProsecutorCaseList: undefined;
  ProsecutorAssignJudge: { caseId: number };
  ProsecutorCaseDetail: { caseId: number };
  ProsecutorCalendar: undefined;

  // --- 👨‍⚖️ JUSTICE (JUGE) ---
  JudgeHome: undefined;
  JudgeCases: undefined;
  JudgeConfiscation: {caseId: number; decisionId?: number };
  JudgeCaseList: undefined;
  JudgeVerdict: { caseId: number };
  JudgeDecisions: undefined;
  JudgePreventiveDetention: { caseId: number; personName?: string };
  JudgeProsecution: { caseId: number };
  JudgeRelease: { caseId: number };
  JudgeReparation: { caseId: number; decisionId: number };
  JudgeHearing: undefined;
  
  // ✅ CORRECTION MAJEURE ICI :
  JudgeCaseDetail: { caseId: number }; // Ancien nom (gardé pour compatibilité)
  CaseDetail: { caseId: number };      // ✅ Nouveau nom utilisé dans JudgeStack.tsx
  
  JudgeSentence: undefined;
  JudgeCalendar: undefined;
  CreateDecision: { caseId: number };
  IssueArrestWarrant: { caseId: number };
  JudgeAppeal: { caseId: number; personName?: string };
  JudgeCaseListScreen: undefined;

  // --- 👮‍♂️ COMMISSAIRE ---
  CommissaireGAVSupervision: undefined;
  CommissaireReview: { id: number } | { complaintId: number }; // ✅ Supporte les deux formats
  CommissaireRegistry: undefined;
  
  // ✅ CORRECTION DU PARAMÈTRE (id vs actionId)
  CommissaireActionDetail: { id: number }; // On utilise 'id' dans les écrans, pas 'actionId'
  
  CommissaireDashboard: undefined;
  CommissaireVisaList: undefined;
  CommissaireCommandCenter: undefined;

  // --- 📝 GREFFIER ---
  ClerkHome: undefined;
  ClerkCalendar: undefined;
  ClerkComplaints: undefined;
  ClerkHearings: undefined;
  ClerkProsecution: undefined;
  ClerkHearing: undefined;
  ClerkHearingDetails: { caseId: number; caseNumber: string };
  ClerkRegisterCase: { complaintId: number };
  ClerkEvidence: undefined;
  ClerkConfiscation: { caseId: string };
  ClerkComplaintDetails: { id: number };
  ClerkAdjournHearing: { hearingId: number | string; caseNumber: string };
  ClerkRelease: undefined;
  ClerkWitness: undefined;

  // --- 📜 HUISSIER (BAILIFF) ---
  BailiffHome: undefined;
  BailiffMissions: undefined;
  BailiffCalendar: undefined;

  // --- ⚖️ AVOCAT (LAWYER) ---
  LawyerCalendar: undefined;
  LawyerCaseDetail: { caseId: number };
  LawyerCaseList: undefined;
  LawyerNotifications: undefined;
  LawyerSubmitBrief: undefined;
  LawyerTracking: undefined;
  LawyerHome: undefined;

  // --- 👨‍👩‍👧‍👦 CITOYEN ---
  CitizenHome: undefined;
  CitizenCreateComplaint: undefined;
  CitizenMyComplaints: undefined;
  CitizenTracking: undefined;
  CitizenCases: undefined;
  CitizenComplaintDetails: { complaintId?: number };
  CitizenCriminalRecord: undefined;
  CitizenDirectory: undefined;
  CitizenEditComplaint: { complaint: Complaint };
  StationMapScreen: undefined;
};

// --- Helpers de Types ---
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type AdminScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type PoliceScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type JudgeScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type CitizenScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type ClerkScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type BailiffScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type LawyerScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;
export type ProsecutorScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
