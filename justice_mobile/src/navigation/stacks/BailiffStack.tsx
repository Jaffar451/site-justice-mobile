import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Huissier (Bailiff) ---
import BailiffMissionsScreen from '../../screens/bailiff/BailiffMissionsScreen';
// Note: Ajoutez ici d'autres écrans huissier (ex: BailiffMissionDetail) si existants

// --- Écrans Partagés (Système & Support) ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const BailiffStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="BailiffMissions"
  >
    {/* ==========================================
        📜 MISSIONS DE L'HUISSIER (Métier)
    ========================================== */}
    <Stack.Screen name="BailiffMissions" component={BailiffMissionsScreen} />
    {/* <Stack.Screen name="BailiffMissionDetail" component={BailiffMissionDetailScreen as any} /> */}

    {/* ==========================================
        👤 COMPTE & SYSTÈME (Header/Footer/Settings)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={ProfileScreen} /> 
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ OUTILS TRANSVERSAUX & SOS
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
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

export default BailiffStack;