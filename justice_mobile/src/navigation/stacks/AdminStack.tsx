import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';

// --- 📊 TABLEAU DE BORD & STATS ---
import AdminHomeScreen from '../../screens/admin/AdminHomeScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminLogsScreen from '../../screens/admin/AdminLogsScreen';

// --- 👥 GESTION UTILISATEURS ---
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';

// --- 🔒 SÉCURITÉ & MAINTENANCE ---
import AdminSecurityScreen from '../../screens/admin/AdminSecurityScreen';
import AdminSecurityDashboardScreen from '../../screens/admin/AdminSecurityDashboardScreen';
import AdminAuditTrailScreen from '../../screens/admin/AdminAuditTrailScreen';
import AdminMaintenanceScreen from '../../screens/admin/AdminMaintenanceScreen';

// --- 🏢 JURIDICTIONS & LOGISTIQUE ---
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';

// --- ⚙️ PARAMÈTRES & NOTIFICATIONS ADMIN ---
import AdminSettingsScreen from '../../screens/admin/AdminSettingsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import AdminEditProfileScreen from '../../screens/admin/AdminEditProfileScreen';

// --- 🌍 ÉCRANS PARTAGÉS (Hérités de SharedStackParamList) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen'; // Version standard
import AboutScreen from '../../screens/shared/AboutScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminStack() {
  return (
    <Stack.Navigator 
      initialRouteName="AdminHome" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {/* ==========================================
          📊 DASHBOARD
      ========================================== */}
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
      <Stack.Screen name="AdminLogs" component={AdminLogsScreen} />

      {/* ==========================================
          👥 GESTION RH (Utilisateurs)
      ========================================== */}
      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
      <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen} />
      <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen} />

      {/* ==========================================
          🔒 SÉCURITÉ & SYSTÈME
      ========================================== */}
      <Stack.Screen name="AdminSecurity" component={AdminSecurityScreen} />
      <Stack.Screen name="AdminSecurityDashboard" component={AdminSecurityDashboardScreen} />
      <Stack.Screen name="AdminAuditTrail" component={AdminAuditTrailScreen} />
      <Stack.Screen name="AdminMaintenance" component={AdminMaintenanceScreen} />

      {/* ==========================================
          🏢 INFRASTRUCTURE (Tribunaux & Commissariats)
      ========================================== */}
      <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
      <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />
      <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
      <Stack.Screen name="NationalMap" component={NationalMapScreen} />

      {/* ==========================================
          ⚙️ CONFIGURATION ADMIN
      ========================================== */}
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      {/* Profil spécifique Admin (si différent du profil standard) */}
      <Stack.Screen name="AdminEditProfile" component={AdminEditProfileScreen} />

      {/* ==========================================
          🌍 ROUTES PARTAGÉES (Profil, Aide, etc.)
      ========================================== */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      {/* EditProfile standard (au cas où on navigue vers celui-ci) */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={AdminNotificationsScreen} /> {/* Alias */}
      
      <Stack.Screen name="UserGuide" component={UserGuideScreen} />
      <Stack.Screen name="HelpCenter" component={UserGuideScreen} /> {/* Alias */}
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    </Stack.Navigator>
  );
}