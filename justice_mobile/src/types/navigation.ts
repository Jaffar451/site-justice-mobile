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
 * 🌍 ROOT STACK (Liste complète et finale)
 */
export type RootStackParamList = {
  // --- Auth ---
  Auth: NavigatorScreenParams<AuthStackParamList>;

  // ✅ AJOUT CRUCIAL : La route principale qui contient le Drawer
  Main: undefined; 

  // --- Shared (Accessibles par tous) ---
  Profile: undefined;
  EditProfile: undefined; // ✅ AJOUTÉ : Pour l'écran de modification de profil générique
  Settings: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  About: undefined;
  UserGuide: undefined;
  Support: undefined;
  MyDownloads: undefined; // ✅ AJOUT : Pour l'écran "Mes Téléchargements"
  
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

  // Gestion Juridictions & Unités
  AdminCourts: undefined;
  AdminCreateCourt: undefined;
  ManageStations: undefined;
  NationalMap: undefined;
  AdminSettings: undefined;
  AdminNotifications: undefined;

  // --- 👮 POLICE ---
  CreateSummon: undefined;
  PoliceHome: undefined;
  PoliceSearchWarrant: undefined;
  PoliceComplaints: undefined;
  PoliceCases: undefined;
  PolicePVScreen: { complaintId?: number };
  PoliceCustody: { complaintId: number; suspectName: string };
  PoliceArrestWarrant: undefined;
  PoliceDetention: { id?: number };
  PoliceInterrogation: { id?: number };
  WarrantSearch: undefined;
  PoliceCustodyExtension: { caseId: number; suspectName: string };
  SosDetail: { alert: any };
  PoliceComplaintDetails: { complaintId: number };

  // --- ⚖️ PROCUREUR ---
  ProsecutorHome: undefined;
  ProsecutorDashboard: undefined;
  ProsecutorCaseList: undefined;
  ProsecutorAssignJudge: { caseId: number };
  ProsecutorCaseDetail: { caseId: number };

  // --- 👨‍⚖️ JUSTICE (JUGE) ---
  JudgeHome: undefined;
  JudgeCases: undefined;
  JudgeConfiscation: undefined;
  JudgeCaseList: undefined;
  JudgeVerdict: { caseId: number };
  JudgeDecisions: undefined;
  JudgePreventiveDetention: { caseId: number };
  JudgeProsecution: { caseId: number };
  JudgeRelease: { caseId: number };
  JudgeReparation: { caseId: number };
  JudgeHearing: undefined;
  JudgeCaseDetail: { caseId: number };
  JudgeSentence: undefined;
  JudgeCalendar: undefined;
  CreateDecision: { caseId: number };
  IssueArrestWarrant: { caseId: number };
  JudgeAppeal: { caseId: number; personName?: string };

  // --- 👮‍♂️ COMMISSAIRE ---
  CommissaireGAVSupervision: undefined;
  CommissaireReview: undefined;
  CommissaireRegistry: undefined;
  CommissaireActionDetail: { actionId: number };
  CommissaireDashboard: undefined;
  CommissaireVisaList: undefined;

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