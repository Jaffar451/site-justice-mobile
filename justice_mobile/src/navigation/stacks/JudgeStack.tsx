// PATH: src/navigation/stacks/JudgeStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Juge ---
import JudgeHomeScreen from '../../screens/judge/JudgeHomeScreen';
import JudgeCaseListScreen from '../../screens/judge/JudgeCaseListScreen';
import JudgeCaseDetailScreen from '../../screens/judge/JudgeCaseDetailScreen'; 
import JudgeHearingScreen from '../../screens/judge/JudgeHearingScreen';
import CreateDecisionScreen from '../../screens/judge/CreateDecisionScreen';
import JudgeDecisionsScreen from '../../screens/judge/JudgeDecisionsScreen';
import IssueArrestWarrantScreen from '../../screens/judge/IssueArrestWarrantScreen';
import JudgeAppealScreen from '../../screens/judge/JudgeAppealScreen';

// --- Écrans de Procédures ---
import JudgeVerdictScreen from '../../screens/judge/JudgeVerdictScreen';
import JudgeSentenceScreen from '../../screens/judge/JudgeSentenceScreen';
import JudgeReleaseScreen from '../../screens/judge/JudgeReleaseScreen';
import JudgeProsecutionScreen from '../../screens/judge/JudgeProsecutionScreen';
import JudgePreventiveDetentionScreen from '../../screens/judge/JudgePreventiveDetentionScreen';
import JudgeReparationScreen from '../../screens/judge/JudgeReparationScreen';
import JudgeConfiscationScreen from '../../screens/judge/JudgeConfiscationScreen';

// --- Écrans Partagés ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const JudgeStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
    // ✅ Utilisation du nom exact défini dans RootStackParamList
    initialRouteName="JudgeHome"
  >
    {/* ==========================================
        🏠 ACCUEIL
    ========================================== */}
    <Stack.Screen name="JudgeHome" component={JudgeHomeScreen} />
    
    {/* ==========================================
        📂 DOSSIERS & INSTRUCTION
    ========================================== */}
    <Stack.Screen name="JudgeCaseList" component={JudgeCaseListScreen as any} />
    <Stack.Screen name="JudgeCaseDetail" component={JudgeCaseDetailScreen as any} />
    <Stack.Screen name="IssueArrestWarrant" component={IssueArrestWarrantScreen as any} />
    <Stack.Screen name="JudgePreventiveDetention" component={JudgePreventiveDetentionScreen as any} />

    {/* ==========================================
        📅 CALENDRIER
    ========================================== */}
    <Stack.Screen name="JudgeCalendar" component={JudgeHearingScreen as any} />
    <Stack.Screen name="JudgeHearing" component={JudgeHearingScreen as any} />

    {/* ==========================================
        ⚖️ DÉCISIONS & RECOURS
    ========================================== */}
    <Stack.Screen name="CreateDecision" component={CreateDecisionScreen as any} />
    <Stack.Screen name="JudgeDecisions" component={JudgeDecisionsScreen as any} />
    <Stack.Screen name="JudgeVerdict" component={JudgeVerdictScreen as any} />
    <Stack.Screen name="JudgeSentence" component={JudgeSentenceScreen as any} />
    <Stack.Screen name="JudgeAppeal" component={JudgeAppealScreen as any} />

    {/* ==========================================
        📜 EXÉCUTION
    ========================================== */}
    <Stack.Screen name="JudgeRelease" component={JudgeReleaseScreen as any} />
    <Stack.Screen name="JudgeProsecution" component={JudgeProsecutionScreen as any} />
    <Stack.Screen name="JudgeReparation" component={JudgeReparationScreen as any} />
    <Stack.Screen name="JudgeConfiscation" component={JudgeConfiscationScreen as any} />

    {/* ==========================================
        🔍 OUTILS & SYSTÈME
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default JudgeStack;