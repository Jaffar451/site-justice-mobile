// PATH: src/navigation/stacks/AdminStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans de Gestion Admin (Métier) ---
import AdminHomeScreen from '../../screens/admin/AdminHomeScreen';
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminLogsScreen from '../../screens/admin/AdminLogsScreen';
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminSettingsScreen from '../../screens/admin/AdminSettingsScreen';
import AdminAuditTrailScreen from '../../screens/admin/AdminAuditTrailScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import AdminSecurityScreen from '../../screens/admin/AdminSecurityScreen';
import AdminMaintenanceScreen from '../../screens/admin/AdminMaintenanceScreen';
import AdminSecurityDashboardScreen from '../../screens/admin/AdminSecurityDashboardScreen';

// --- Écrans Partagés (Système & Support) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AdminStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right' 
    }}
    initialRouteName="AdminHome"
  >
    {/* ==========================================
        🏠 ACCUEIL & MONITORING
    ========================================== */}
    <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
    <Stack.Screen name="AdminStats" component={AdminStatsScreen} />

    {/* ==========================================
        👥 GESTION DES UTILISATEURS (RH)
    ========================================== */}
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
    <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen as any} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen as any} />

    {/* ==========================================
        ⚖️ INFRASTRUCTURES (Tribunaux & Unités)
    ========================================== */}
    <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
    <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />

    {/* ==========================================
        🛡️ SÉCURITÉ, AUDIT & MAINTENANCE
    ========================================== */}
    <Stack.Screen name="AdminSecurityDashboard" component={AdminSecurityDashboardScreen} />
    <Stack.Screen name="AdminSecurity" component={AdminSecurityScreen} />
    <Stack.Screen name="AdminAuditTrail" component={AdminAuditTrailScreen} />
    <Stack.Screen name="AdminLogs" component={AdminLogsScreen} />
    <Stack.Screen name="AdminMaintenance" component={AdminMaintenanceScreen} />
    <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />

    {/* ==========================================
        👤 PROFIL & NOTIFICATIONS
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />
    <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />

    {/* ==========================================
        🗺️ OUTILS TRANSVERSAUX & SOS
    ========================================== */}
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    {/* ==========================================
        ℹ️ ASSISTANCE & SUPPORT
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default AdminStack;