// PATH: src/navigation/stacks/ClerkStack.tsx
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

// --- Écrans Profil & Système ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import NotificationsScreen from '../../screens/admin/AdminNotificationsScreen'; 

// --- Écrans Partagés & Support ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const ClerkStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
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
    <Stack.Screen name="ClerkEvidence" component={ClerkEvidenceScreen as any} />
    <Stack.Screen name="ClerkWitness" component={ClerkWitnessScreen as any} />

    {/* ==========================================
        📅 CALENDRIER & AUDIENCES
    ========================================== */}
    <Stack.Screen name="ClerkCalendar" component={ClerkCalendarScreen as any} />
    <Stack.Screen name="ClerkHearings" component={ClerkHearingsScreen as any} />
    <Stack.Screen name="ClerkHearingDetails" component={ClerkHearingDetailsScreen as any} />
    <Stack.Screen name="ClerkAdjournHearing" component={ClerkAdjournHearingScreen as any} />

    {/* ==========================================
        📜 EXÉCUTION DES DÉCISIONS
    ========================================== */}
    <Stack.Screen name="ClerkProsecution" component={ClerkProsecutionScreen as any} />
    <Stack.Screen name="ClerkRelease" component={ClerkReleaseScreen as any} />
    <Stack.Screen name="ClerkConfiscation" component={ClerkConfiscationScreen as any} />

    {/* ==========================================
        🔍 RECHERCHE & GÉOPOSITION
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />

    {/* ==========================================
        👤 COMPTE, NOTIFICATIONS & SUPPORT
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen as any} />
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default ClerkStack;