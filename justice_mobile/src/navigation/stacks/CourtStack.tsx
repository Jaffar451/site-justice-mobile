import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Écrans Gestion des Tribunaux ---
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';

// --- Écrans Contextuels & Pilotage ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';

// --- Écran Commun ---
import ProfileScreen from '../../screens/Profile/ProfileScreen'; // ✅ Requis par AppHeader

export type CourtStackParamList = {
  AdminCourts: undefined;
  AdminCreateCourt: undefined;
  NationalMap: undefined;
  AdminStats: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<CourtStackParamList>();

export const CourtStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="AdminCourts"
  >
    {/* ==========================================
        ⚖️ GESTION DES JURIDICTIONS (Tribunaux)
    ========================================== */}
    <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
    <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />

    {/* ==========================================
        🗺️ CARTOGRAPHIE ET ANALYSE
    ========================================== */}
    {/* Permet de visualiser l'implantation des tribunaux sur le territoire */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    
    {/* Permet de suivre le volume de traitement des dossiers par tribunal */}
    <Stack.Screen name="AdminStats" component={AdminStatsScreen as any} />

    {/* ==========================================
        👤 COMPTE & PARAMÈTRES (Sécurité Header)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />

  </Stack.Navigator>
);

export default CourtStack;