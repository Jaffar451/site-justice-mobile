import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Juge (Magistrature) ---
import JudgeHomeScreen from '../../screens/judge/JudgeHomeScreen';
import JudgeCaseListScreen from '../../screens/judge/JudgeCaseListScreen';
import JudgeHearingScreen from '../../screens/judge/JudgeHearingScreen';
import JudgeCaseDetailScreen from '../../screens/judge/JudgeCaseDetailScreen';
import CreateDecisionScreen from '../../screens/judge/CreateDecisionScreen';
import JudgeVerdictScreen from '../../screens/judge/JudgeVerdictScreen';
import JudgeSentenceScreen from '../../screens/judge/JudgeSentenceScreen';
import JudgeReleaseScreen from '../../screens/judge/JudgeReleaseScreen';
import JudgeProsecutionScreen from '../../screens/judge/JudgeProsecutionScreen';
import JudgePreventiveDetentionScreen from '../../screens/judge/JudgePreventiveDetentionScreen';
import JudgeReparationScreen from '../../screens/judge/JudgeReparationScreen';
import JudgeConfiscationScreen from '../../screens/judge/JudgeConfiscationScreen';

// --- Écrans Partagés & Communs ---
import ProfileScreen from '../../screens/Profile/ProfileScreen'; // ✅ Requis par AppHeader
import NationalMapScreen from '../../screens/admin/NationalMapScreen'; // ✅ Pour le suivi des incidents
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen'; // ✅ Pour vérifier les mandats

const Stack = createNativeStackNavigator<RootStackParamList>();

export const JudgeStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="JudgeHome"
  >
    {/* ==========================================
        🏛️ CABINET DU JUGE (Dashboard & Dossiers)
    ========================================== */}
    <Stack.Screen name="JudgeHome" component={JudgeHomeScreen} />
    <Stack.Screen name="JudgeCaseList" component={JudgeCaseListScreen} />
    <Stack.Screen name="JudgeCaseDetail" component={JudgeCaseDetailScreen as any} />
    
    {/* ==========================================
        📅 CALENDRIER DES AUDIENCES
    ========================================== */}
    <Stack.Screen name="JudgeCalendar" component={JudgeHearingScreen as any} />
    
    {/* ==========================================
        ⚖️ DÉCISIONS, VERDICTS & SENTENCES
    ========================================== */}
    <Stack.Screen name="CreateDecision" component={CreateDecisionScreen as any} />
    <Stack.Screen name="JudgeVerdict" component={JudgeVerdictScreen as any} />
    <Stack.Screen name="JudgeSentence" component={JudgeSentenceScreen as any} />
    <Stack.Screen name="JudgeRelease" component={JudgeReleaseScreen as any} />
    <Stack.Screen name="JudgeProsecution" component={JudgeProsecutionScreen as any} />
    <Stack.Screen name="JudgePreventiveDetention" component={JudgePreventiveDetentionScreen as any} />
    <Stack.Screen name="JudgeReparation" component={JudgeReparationScreen as any} />
    <Stack.Screen name="JudgeConfiscation" component={JudgeConfiscationScreen as any} />

    {/* ==========================================
        🔍 CONTRÔLE & RECHERCHE
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />

    {/* ==========================================
        👤 COMPTE & PARAMÈTRES (Requis par AppHeader)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />

  </Stack.Navigator>
);

export default JudgeStack;