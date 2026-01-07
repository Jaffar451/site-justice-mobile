import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Commissaire (Commandement) ---
import CommissaireDashboard from '../../screens/commissaire/CommissaireDashboard';
import CommissaireVisaList from '../../screens/commissaire/CommissaireVisaList';
import CommissaireGAVSupervisionScreen from '../../screens/commissaire/CommissaireGAVSupervisionScreen';
import CommissaireRegistryScreen from '../../screens/commissaire/CommissaireRegistryScreen';
import CommissaireReviewScreen from '../../screens/commissaire/CommissaireReviewScreen';
import CommissaireActionDetail from '../../screens/commissaire/CommissaireActionDetail';

// --- Écrans Partagés & Support ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen'; // ✅ Pour la supervision des incidents
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen'; // ✅ Pour le contrôle des mandats
import ProfileScreen from '../../screens/Profile/ProfileScreen'; // ✅ Requis par AppHeader

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CommissaireStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="CommissaireDashboard"
  >
    {/* ==========================================
        📈 DIRECTION & PILOTAGE UNITÉ
    ========================================== */}
    <Stack.Screen name="CommissaireDashboard" component={CommissaireDashboard as any} />
    
    {/* ==========================================
        🛡️ VALIDATION (VISAS) & RÉVISION
    ========================================== */}
    <Stack.Screen name="CommissaireVisaList" component={CommissaireVisaList as any} />
    <Stack.Screen name="CommissaireReview" component={CommissaireReviewScreen as any} />
    <Stack.Screen name="CommissaireActionDetail" component={CommissaireActionDetail as any} />

    {/* ==========================================
        🔒 SUPERVISION OPÉRATIONNELLE (GAV)
    ========================================== */}
    <Stack.Screen name="CommissaireGAVSupervision" component={CommissaireGAVSupervisionScreen as any} />
    <Stack.Screen name="CommissaireRegistry" component={CommissaireRegistryScreen as any} />

    {/* ==========================================
        🔍 CONTRÔLE TERRITORIAL & RECHERCHE
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />

    {/* ==========================================
        👤 COMPTE & PARAMÈTRES (Sécurité Header)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />

  </Stack.Navigator>
);

export default CommissaireStack;