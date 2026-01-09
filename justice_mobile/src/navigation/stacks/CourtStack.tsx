// PATH: src/navigation/stacks/CourtStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Gestion des Tribunaux (Infrastructures) ---
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';

// --- Écrans Contextuels & Pilotage ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// --- Écrans Partagés (Profil & Support) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CourtStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
    initialRouteName="AdminCourts"
  >
    {/* ==========================================
        ⚖️ GESTION DES JURIDICTIONS (Tribunaux)
    ========================================== */}
    <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
    <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />

    {/* ==========================================
        🗺️ CARTOGRAPHIE ET ANALYSE TERRITORIALE
    ========================================== */}
    {/* Visualisation de l'implantation des tribunaux sur le territoire nigérien */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    
    {/* Analyse du volume de traitement des dossiers par tribunal/juridiction */}
    <Stack.Screen name="AdminStats" component={AdminStatsScreen as any} />

    {/* ==========================================
        👤 COMPTE, SYSTÈME & NOTIFICATIONS
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        ℹ️ ASSISTANCE & DOCUMENTATION MJ
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default CourtStack;