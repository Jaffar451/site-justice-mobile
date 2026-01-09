// PATH: src/navigation/stacks/UserStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Gestion des Utilisateurs (RH Admin) ---
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';

// --- Écrans Contexte & Pilotage ---
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';

// --- Écrans Profil & Système (Partagés) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

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
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen as any} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen as any} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen as any} />
    <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen as any} />

    {/* ==========================================
        🏢 CONTEXTE OPÉRATIONNEL & PERFORMANCE
    ========================================== */}
    <Stack.Screen name="ManageStations" component={ManageStationsScreen as any} />
    <Stack.Screen name="AdminStats" component={AdminStatsScreen as any} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />

    {/* ==========================================
        👤 COMPTE & IDENTITÉ NUMÉRIQUE
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={ProfileScreen as any} /> 
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ ALERTES SOS & DOCUMENTS
    ========================================== */}
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen as any} />

    {/* ==========================================
        ℹ️ ASSISTANCE & SUPPORT TECHNIQUE
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default UserStack;