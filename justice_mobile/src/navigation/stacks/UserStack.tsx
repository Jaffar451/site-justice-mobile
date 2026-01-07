import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Écrans Gestion des Utilisateurs ---
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';

// --- Écrans Complémentaires Admin ---
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// --- Écrans Communs & Support ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

export type UserStackParamList = {
  AdminUsers: undefined;
  AdminCreateUser: undefined;
  AdminUserDetails: { userId: number };
  AdminEditUser: { userId: number };
  ManageStations: undefined;
  AdminStats: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  SosDetail: { sosId: string | number };
  NationalMap: undefined;
  MyDownloads: undefined;
  UserGuide: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="AdminUsers"
  >
    {/* ==========================================
        👥 GESTION DES AGENTS & UTILISATEURS
    ========================================== */}
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen as any} />
    <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen as any} />

    {/* ==========================================
        🏢 CONTEXTE OPÉRATIONNEL & STATS
    ========================================== */}
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="AdminStats" component={AdminStatsScreen as any} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />

    {/* ==========================================
        👤 COMPTE & SYSTÈME (Header/Footer)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={ProfileScreen as any} /> 
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ ALERTES & DOCUMENTS
    ========================================== */}
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    {/* ==========================================
        ℹ️ ASSISTANCE
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default UserStack;