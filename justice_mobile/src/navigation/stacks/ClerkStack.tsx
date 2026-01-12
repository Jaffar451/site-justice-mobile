import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ClerkStackParamList } from '../../types/navigation';

// --- 📝 Écrans Métier Greffier ---
import ClerkHomeScreen from '../../screens/clerk/ClerkHomeScreen';
import ClerkCalendarScreen from '../../screens/clerk/ClerkCalendarScreen';
import ClerkComplaintsScreen from '../../screens/clerk/ClerkComplaintsScreen';
import ClerkHearingsScreen from '../../screens/clerk/ClerkHearingsScreen';
import ClerkHearingDetailsScreen from '../../screens/clerk/ClerkHearingDetailsScreen';
import ClerkProsecutionScreen from '../../screens/clerk/ClerkProsecutionScreen';
import ClerkRegisterCaseScreen from '../../screens/clerk/ClerkRegisterCaseScreen';
import ClerkComplaintDetailsScreen from '../../screens/clerk/ClerkComplaintDetailsScreen';
import ClerkAdjournHearingScreen from '../../screens/clerk/ClerkAdjournHearingScreen';
import ClerkConfiscationScreen from '../../screens/clerk/ClerkConfiscationScreen';
import ClerkEvidenceScreen from '../../screens/clerk/ClerkEvidenceScreen';
import ClerkReleaseScreen from '../../screens/clerk/ClerkReleaseScreen';
import ClerkWitnessScreen from '../../screens/clerk/ClerkWitnessScreen';

// --- ✅ NOUVEAUX ÉCRANS PARTAGÉS (Scanner & Rapport) ---
import VerificationScannerScreen from '../../screens/shared/VerificationScannerScreen';
import WeeklyReportScreen from '../../screens/shared/WeeklyReportScreen';

// --- 🌍 Écrans PARTAGÉS (Système & Support) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';
import AboutScreen from '../../screens/shared/AboutScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

const Stack = createNativeStackNavigator<ClerkStackParamList>();

export default function ClerkStack() {
  return (
    <Stack.Navigator 
      initialRouteName="ClerkHome" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {/* ==========================================
          📝 BUREAU & ACCUEIL
      ========================================== */}
      <Stack.Screen name="ClerkHome" component={ClerkHomeScreen} />
      <Stack.Screen name="ClerkCalendar" component={ClerkCalendarScreen} />

      {/* ==========================================
          ✅ OUTILS QUOTIDIENS (Nouveaux)
      ========================================== */}
      {/* Scanner pour vérifier les actes et QR Codes */}
      <Stack.Screen name="VerificationScanner" component={VerificationScannerScreen as any} />
      {/* Rapport d'activité du Greffe (Lundi) */}
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen as any} />

      {/* ==========================================
          📂 GESTION DES DOSSIERS & ENRÔLEMENT
      ========================================== */}
      <Stack.Screen name="ClerkComplaints" component={ClerkComplaintsScreen} />
      <Stack.Screen name="ClerkRegisterCase" component={ClerkRegisterCaseScreen} />
      <Stack.Screen name="ClerkComplaintDetails" component={ClerkComplaintDetailsScreen} />
      <Stack.Screen name="ClerkProsecution" component={ClerkProsecutionScreen} />

      {/* ==========================================
          ⚖️ AUDIENCES & PROCÈS
      ========================================== */}
      <Stack.Screen name="ClerkHearings" component={ClerkHearingsScreen} />
      <Stack.Screen name="ClerkHearing" component={ClerkHearingsScreen} /> 
      <Stack.Screen name="ClerkHearingDetails" component={ClerkHearingDetailsScreen} />
      <Stack.Screen name="ClerkAdjournHearing" component={ClerkAdjournHearingScreen} />
      <Stack.Screen name="ClerkWitness" component={ClerkWitnessScreen} />

      {/* ==========================================
          📦 PIÈCES À CONVICTION & SCELLÉS
      ========================================== */}
      <Stack.Screen name="ClerkEvidence" component={ClerkEvidenceScreen} />
      <Stack.Screen name="ClerkConfiscation" component={ClerkConfiscationScreen} />
      <Stack.Screen name="ClerkRelease" component={ClerkReleaseScreen} />

      {/* ==========================================
          👤 COMPTE & SYSTÈME
      ========================================== */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />
      <Stack.Screen name="NationalMap" component={NationalMapScreen} />

      {/* ==========================================
          ℹ️ AIDE & RESSOURCES
      ========================================== */}
      <Stack.Screen name="UserGuide" component={UserGuideScreen} />
      <Stack.Screen name="HelpCenter" component={UserGuideScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    </Stack.Navigator>
  );
}