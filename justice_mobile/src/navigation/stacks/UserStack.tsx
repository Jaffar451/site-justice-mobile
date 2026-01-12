import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';

// --- 👥 Écrans Gestion des Utilisateurs (RH Admin) ---
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';

// --- ✅ NOUVEAUX ÉCRANS PARTAGÉS (Scanner & Rapport) ---
import VerificationScannerScreen from '../../screens/shared/VerificationScannerScreen';
import WeeklyReportScreen from '../../screens/shared/WeeklyReportScreen';

// --- 🏢 Écrans Contexte & Pilotage ---
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';

// --- 🌍 Écrans Profil & Système (Partagés) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen'; 
import AboutScreen from '../../screens/shared/AboutScreen'; 
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

// --- 🚨 Écrans Transversaux ---
import SosDetailScreen from '../../screens/police/SosDetailScreen';

// ✅ TYPAGE HYBRIDE : Admin + Outils Transversaux
type UserStackParams = AdminStackParamList & {
  SosDetail: { alert: any };
  VerificationScanner: undefined; // Ajouté
  WeeklyReport: undefined;        // Ajouté
};

const Stack = createNativeStackNavigator<UserStackParams>();

export const UserStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
    initialRouteName="AdminUsers"
  >
    {/* ==========================================
        👥 GESTION DES AGENTS ET DES RÔLES
    ========================================== */}
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen} />
    <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen} />

    {/* ==========================================
        ✅ OUTILS RH & CONTRÔLE (Nouveaux)
    ========================================== */}
    {/* Scanner pour vérifier les badges ou dossiers agents */}
    <Stack.Screen name="VerificationScanner" component={VerificationScannerScreen as any} />
    {/* Rapport d'activité RH (Recrutements, effectifs...) */}
    <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen as any} />

    {/* ==========================================
        🏢 CONTEXTE OPÉRATIONNEL & PERFORMANCE
    ========================================== */}
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen} />

    {/* ==========================================
        👤 COMPTE & IDENTITÉ NUMÉRIQUE
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    
    {/* ✅ CORRECTION : Alias pour éviter le crash "AdminEditProfile not handled" */}
    <Stack.Screen name="AdminEditProfile" component={EditProfileScreen} />
    
    <Stack.Screen name="Settings" component={SettingsScreen} /> 
    
    <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
    {/* Alias pour la navigation partagée */}
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ ALERTES SOS & DOCUMENTS
    ========================================== */}
    {/* Route hybride autorisée grâce à UserStackParams */}
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    {/* ==========================================
        ℹ️ ASSISTANCE & SUPPORT TECHNIQUE
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    {/* Alias HelpCenter */}
    <Stack.Screen name="HelpCenter" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />

  </Stack.Navigator>
);

export default UserStack;