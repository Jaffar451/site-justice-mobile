import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Greffier (Clerk) ---
import ClerkHomeScreen from '../../screens/clerk/ClerkHomeScreen';
import ClerkCalendarScreen from '../../screens/clerk/ClerkCalendarScreen';
import ClerkComplaintsScreen from '../../screens/clerk/ClerkComplaintsScreen';
import ClerkHearingsScreen from '../../screens/clerk/ClerkHearingsScreen';
import ClerkHearingDetailsScreen from '../../screens/clerk/ClerkHearingDetailsScreen';
import ClerkAdjournHearingScreen from '../../screens/clerk/ClerkAdjournHearingScreen';
import ClerkComplaintDetailsScreen from '../../screens/clerk/ClerkComplaintDetailsScreen';
import ClerkRegisterCaseScreen from '../../screens/clerk/ClerkRegisterCaseScreen';
import ClerkEvidenceScreen from '../../screens/clerk/ClerkEvidenceScreen';
import ClerkWitnessScreen from '../../screens/clerk/ClerkWitnessScreen';
import ClerkProsecutionScreen from '../../screens/clerk/ClerkProsecutionScreen';
import ClerkReleaseScreen from '../../screens/clerk/ClerkReleaseScreen';
import ClerkConfiscationScreen from '../../screens/clerk/ClerkConfiscationScreen';

// --- Écrans Partagés & Support ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen'; // ✅ Pour la géolocalisation des dossiers
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen'; // ✅ Pour la vérification des mandats
import ProfileScreen from '../../screens/Profile/ProfileScreen'; // ✅ Requis par AppHeader

const Stack = createNativeStackNavigator<RootStackParamList>();

export const ClerkStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="ClerkHome"
  >
    {/* ==========================================
        📈 BUREAU DU GREFFE (Accueil & Rôles)
    ========================================== */}
    <Stack.Screen name="ClerkHome" component={ClerkHomeScreen} />
    <Stack.Screen name="ClerkComplaints" component={ClerkComplaintsScreen} />
    <Stack.Screen name="ClerkComplaintDetails" component={ClerkComplaintDetailsScreen as any} />
    
    {/* ==========================================
        ⚖️ ENRÔLEMENT & INSTRUCTION
    ========================================== */}
    <Stack.Screen name="ClerkRegisterCase" component={ClerkRegisterCaseScreen as any} />
    <Stack.Screen name="ClerkEvidence" component={ClerkEvidenceScreen} />
    <Stack.Screen name="ClerkWitness" component={ClerkWitnessScreen} />

    {/* ==========================================
        📅 CALENDRIER & AUDIENCES
    ========================================== */}
    <Stack.Screen name="ClerkCalendar" component={ClerkCalendarScreen as any} />
    <Stack.Screen name="ClerkHearing" component={ClerkHearingsScreen as any} />
    <Stack.Screen name="ClerkHearingDetails" component={ClerkHearingDetailsScreen as any} />
    <Stack.Screen name="ClerkAdjournHearing" component={ClerkAdjournHearingScreen as any} />

    {/* ==========================================
        📜 EXÉCUTION DES DÉCISIONS
    ========================================== */}
    <Stack.Screen name="ClerkProsecution" component={ClerkProsecutionScreen} />
    <Stack.Screen name="ClerkRelease" component={ClerkReleaseScreen} />
    <Stack.Screen name="ClerkConfiscation" component={ClerkConfiscationScreen as any} />

    {/* ==========================================
        🔍 RECHERCHE & GÉOPOSITION
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />

    {/* ==========================================
        👤 COMPTE & PARAMÈTRES (Sécurité Header)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />

  </Stack.Navigator>
);

export default ClerkStack;