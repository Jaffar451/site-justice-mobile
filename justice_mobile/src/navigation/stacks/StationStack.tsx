import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Écrans Admin / Unités ---
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// --- Écrans Communs & Support ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

export type StationStackParamList = {
  ManageStations: undefined;
  NationalMap: undefined;
  AdminUsers: undefined;
  AdminStats: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Notifications: undefined;
  SosDetail: { sosId: string | number };
  WarrantSearch: undefined;
  MyDownloads: undefined;
  UserGuide: undefined;
  Support: undefined;
};

const Stack = createNativeStackNavigator<StationStackParamList>();

export const StationStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="ManageStations"
  >
    {/* ==========================================
        🏢 GESTION DU TERRITOIRE & UNITÉS
    ========================================== */}
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />

    {/* ==========================================
        👥 AGENTS ET RESSOURCES HUMAINES
    ========================================== */}
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />

    {/* ==========================================
        📊 ANALYSE ET PERFORMANCE
    ========================================== */}
    <Stack.Screen name="AdminStats" component={AdminStatsScreen as any} />

    {/* ==========================================
        👤 COMPTE & SYSTÈME (Header/Footer/Settings)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={ProfileScreen as any} /> 
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ OUTILS TRANSVERSAUX & SOS
    ========================================== */}
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />

    {/* ==========================================
        ℹ️ SUPPORT, AIDE & TÉLÉCHARGEMENTS
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

  </Stack.Navigator>
);

export default StationStack;