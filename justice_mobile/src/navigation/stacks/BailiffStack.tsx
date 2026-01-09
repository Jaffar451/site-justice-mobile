import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Huissier (Bailiff) ---
import BailiffHomeScreen from '../../screens/bailiff/BailiffHomeScreen'; // ✅ Ajouté
import BailiffMissionsScreen from '../../screens/bailiff/BailiffMissionsScreen';
import BailiffCalendarScreen from '../../screens/bailiff/BailiffCalendarScreen';
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
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right' 
    }}
    initialRouteName="BailiffHome" // ✅ Le Dashboard est désormais l'accueil
  >
    {/* ==========================================
        🏠 ACCUEIL & TABLEAU DE BORD
    ========================================== */}
    <Stack.Screen name="BailiffHome" component={BailiffHomeScreen} />

    {/* ==========================================
        📜 MISSIONS DE L'HUISSIER (Métier)
    ========================================== */}
    <Stack.Screen name="BailiffMissions" component={BailiffMissionsScreen} />
    <Stack.Screen name="BailiffCalendar" component={BailiffCalendarScreen} />
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