import { NavigatorScreenParams } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Complaint } from "../services/complaint.service";

/**
 * 🔗 ROUTES PARTAGÉES (Accessibles dans tous les Stacks Métiers)
 * Ces routes peuvent être appelées depuis n'importe quel profil.
 */
export type SharedStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  About: undefined;
  UserGuide: undefined;
  Support: undefined;
  MyDownloads: undefined;
  NationalMap: undefined;
  VerificationScanner: undefined; // La carte est utile pour tout le monde (Admin, Police, Juge...)
};

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
 * 👨‍💼 ADMIN STACK (+ Shared)
 */
export type AdminStackParamList = {
  AdminHome: undefined;
  AdminStats: undefined;
  AdminLogs: undefined;
  AdminUsers: undefined;
  AdminCreateUser: undefined;
  AdminEditUser: { userId: number };
  AdminUserDetails: { userId: number };
  AdminEditProfile: undefined;
  AdminSecurity: undefined;
  AdminMaintenance: undefined;
  AdminAuditTrail: undefined;
  AdminSecurityDashboard: undefined;
  AdminCourts: undefined;
  AdminCreateCourt: undefined;
  ManageStations: undefined;
  // NationalMap est hérité de SharedStackParamList
  AdminSettings: undefined;
  AdminNotifications: undefined;
} & SharedStackParamList;

/**
 * 👮 POLICE STACK (+ Shared)
 */
export type PoliceStackParamList = {
  PoliceHome: undefined;
  PoliceComplaints: undefined;
  PoliceCases: undefined;
  PoliceComplaintDetails: { complaintId: number };
  PolicePVScreen: { complaintId?: number };
  PoliceInterrogation: { complaintId: number; suspectName: string };
  PoliceCustody: { complaintId: number; suspectName: string };
  PoliceCustodyExtension: { caseId: number; suspectName: string; complaintId: number };
  PoliceDetention: { complaintId?: number; suspectName: string };
  PoliceArrestWarrant: undefined;
  PoliceSearchWarrant: undefined;
  CreateSummon: { complaintId: number | string };
  WarrantSearch: undefined;
  SosDetail: { alert: any };
} & SharedStackParamList;

/**
 * 👨‍⚖️ JUGE STACK (+ Shared)
 */
export type JudgeStackParamList = {
  JudgeHome: undefined;
  JudgeCases: undefined;
  JudgeCaseList: undefined; // Alias
  JudgeCaseDetails: { caseId: number }; // ✅ Nom standardisé
  CaseDetail: { caseId: number };       // Alias pour compatibilité
  
  // Actes & Procédures
  JudgeInterrogation: { complaintId: number; suspectName: string };
  CreateDecision: { caseId: number };
  IssueArrestWarrant: { caseId: number };
  JudgeConfiscation: { caseId: number; decisionId?: number };
  JudgePreventiveDetention: { caseId: number; personName?: string };
  JudgeReparation: { caseId: number; decisionId?: number };
  JudgeVerdict: { caseId: number };
  JudgeAppeal: { caseId: number; personName?: string };
  
  // Gestion & Calendrier
  JudgeCalendar: undefined;
  JudgeHearing: undefined;
  JudgeDecisions: undefined;
  JudgeSentence: undefined;
  JudgeProsecution: { caseId: number };
  JudgeRelease: { caseId: number };
} & SharedStackParamList;

/**
 * ⚖️ PROCUREUR STACK (+ Shared)
 */
export type ProsecutorStackParamList = {
  ProsecutorHome: undefined;
  ProsecutorDashboard: undefined;
  ProsecutorCaseList: undefined;
  ProsecutorAssignJudge: { caseId: number };
  ProsecutorCaseDetail: { caseId: number };
  ProsecutorCalendar: undefined;
} & SharedStackParamList;

/**
 * 👮‍♂️ COMMISSAIRE STACK (+ Shared)
 */
export type CommissaireStackParamList = {
  CommissaireDashboard: undefined;
  CommissaireReview: { id: number } | { complaintId: number };
  CommissaireActionDetail: { id: number };
  CommissaireVisaList: undefined;
  CommissaireGAVSupervision: undefined;
  CommissaireRegistry: undefined;
  CommissaireCommandCenter: undefined;
} & SharedStackParamList;

/**
 * 📝 GREFFIER STACK (+ Shared)
 */
export type ClerkStackParamList = {
  ClerkHome: undefined;
  ClerkCalendar: undefined;
  ClerkComplaints: undefined;
  ClerkHearings: undefined;
  ClerkHearing: undefined;
  ClerkProsecution: undefined;
  ClerkRegisterCase: { complaintId: number };
  ClerkHearingDetails: { caseId: number; caseNumber: string };
  ClerkComplaintDetails: { id: number };
  ClerkAdjournHearing: { hearingId: number | string; caseNumber: string };
  ClerkConfiscation: { caseId: string };
  ClerkEvidence: undefined;
  ClerkRelease: undefined;
  ClerkWitness: undefined;
} & SharedStackParamList;

/**
 * 👨‍👩‍👧‍👦 CITOYEN STACK (+ Shared)
 */
export type CitizenStackParamList = {
  CitizenHome: undefined;
  CitizenCreateComplaint: undefined;
  CitizenMyComplaints: undefined;
  CitizenComplaintDetails: { complaintId?: number };
  CitizenTracking: undefined;
  CitizenCases: undefined;
  CitizenEditComplaint: { complaint: Complaint };
  CitizenCriminalRecord: undefined;
  CitizenDirectory: undefined;
  StationMapScreen: undefined;
  CitizenLegalGuide: undefined;
  CitizenNotifications: undefined;
} & SharedStackParamList;

/**
 * ⚖️ AVOCAT STACK (+ Shared)
 */
export type LawyerStackParamList = {
  LawyerHome: undefined;
  LawyerCaseList: undefined;
  LawyerCaseDetail: { caseId: number };
  LawyerCalendar: undefined;
  LawyerNotifications: undefined;
  LawyerSubmitBrief: undefined;
  LawyerTracking: undefined;
} & SharedStackParamList;

/**
 * 📜 HUISSIER STACK (+ Shared)
 */
export type BailiffStackParamList = {
  BailiffHome: undefined;
  BailiffMissions: undefined;
  BailiffCalendar: undefined;
} & SharedStackParamList;

/**
 * 🏢 PRISON STACK (+ Shared)
 */
export type PrisonStackParamList = {
  PrisonHome: undefined;
  PrisonInmates: undefined;
  PrisonCheckIn: { warrantId: string };
} & SharedStackParamList;

/**
 * 🌍 ROOT STACK PRINCIPAL
 * Regroupe tous les sous-navigateurs
 */
export type RootStackParamList = {
  // --- Auth ---
  Auth: NavigatorScreenParams<AuthStackParamList>;

  // --- Navigateurs Métiers (Nested Stacks) ---
  AdminStack: NavigatorScreenParams<AdminStackParamList>;
  PoliceStack: NavigatorScreenParams<PoliceStackParamList>;
  JudgeStack: NavigatorScreenParams<JudgeStackParamList>;
  ProsecutorStack: NavigatorScreenParams<ProsecutorStackParamList>;
  CitizenStack: NavigatorScreenParams<CitizenStackParamList>;
  ClerkStack: NavigatorScreenParams<ClerkStackParamList>;
  CommissaireStack: NavigatorScreenParams<CommissaireStackParamList>;
  LawyerStack: NavigatorScreenParams<LawyerStackParamList>;
  BailiffStack: NavigatorScreenParams<BailiffStackParamList>;
  PrisonStack: NavigatorScreenParams<PrisonStackParamList>;

  // --- Fallbacks globaux (au cas où) ---
  Main: undefined;
  ComplaintDetail: { id: string | number };
  ComplaintList: { id: string; complaintId: number };
  PoliceStation: undefined;
} & SharedStackParamList; // Les routes partagées sont aussi accessibles à la racine

// --- Helpers de Types pour les Écrans ---

// Helper générique pour accéder au Root + Son propre Stack
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<RootStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>;
export type AdminScreenProps<T extends keyof AdminStackParamList> = NativeStackScreenProps<AdminStackParamList, T>;
export type PoliceScreenProps<T extends keyof PoliceStackParamList> = NativeStackScreenProps<PoliceStackParamList, T>;
export type JudgeScreenProps<T extends keyof JudgeStackParamList> = NativeStackScreenProps<JudgeStackParamList, T>;
export type ProsecutorScreenProps<T extends keyof ProsecutorStackParamList> = NativeStackScreenProps<ProsecutorStackParamList, T>;
export type CommissaireScreenProps<T extends keyof CommissaireStackParamList> = NativeStackScreenProps<CommissaireStackParamList, T>;
export type ClerkScreenProps<T extends keyof ClerkStackParamList> = NativeStackScreenProps<ClerkStackParamList, T>;
export type CitizenScreenProps<T extends keyof CitizenStackParamList> = NativeStackScreenProps<CitizenStackParamList, T>;
export type LawyerScreenProps<T extends keyof LawyerStackParamList> = NativeStackScreenProps<LawyerStackParamList, T>;
export type BailiffScreenProps<T extends keyof BailiffStackParamList> = NativeStackScreenProps<BailiffStackParamList, T>;
export type PrisonScreenProps<T extends keyof PrisonStackParamList> = NativeStackScreenProps<PrisonStackParamList, T>;

// Extension globale pour que useNavigation() connaisse tous les types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}