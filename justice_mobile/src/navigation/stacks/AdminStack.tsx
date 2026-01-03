import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans de Gestion ---
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

// --- Nouveaux Écrans (Sécurité, Profil, Notifs) ---
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import AdminSecurityScreen from '../../screens/admin/AdminSecurityScreen';
import AdminMaintenanceScreen from '../../screens/admin/AdminMaintenanceScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AdminStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* 🏠 Accueil */}
    <Stack.Screen name="AdminHome" component={AdminHomeScreen} />

    {/* 👥 Gestion Utilisateurs */}
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
    <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen as any} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen as any} />

    {/* ⚖️ Tribunaux */}
    <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
    <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />

    {/* 👮 Unités & Carte */}
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen} />

    {/* 📊 Logs & Stats */}
    <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
    <Stack.Screen name="AdminLogs" component={AdminLogsScreen} />

    {/* ⚙️ Configuration & Sécurité */}
    <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />
    <Stack.Screen name="AdminSecurity" component={AdminSecurityScreen} />
    <Stack.Screen name="AdminMaintenance" component={AdminMaintenanceScreen} />
    
    {/* 🔔 Notifications & Profil */}
    <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
  </Stack.Navigator>
);

export default AdminStack;