// PATH: src/navigation/stacks/LawyerStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Avocat (Lawyer) ---
import LawyerHomeScreen from '../../screens/lawyer/LawyerHomeScreen';
import LawyerCaseListScreen from '../../screens/lawyer/LawyerCaseListScreen';
import LawyerCaseDetailScreen from '../../screens/lawyer/LawyerCaseDetailScreen';
import LawyerCalendarScreen from '../../screens/lawyer/LawyerCalendarScreen';
import LawyerTrackingScreen from '../../screens/lawyer/LawyerTrackingScreen';
import LawyerNotificationsScreen from '../../screens/lawyer/LawyerNotificationsScreen';
import LawyerSubmitBriefScreen from '../../screens/lawyer/LawyerSubmitBriefScreen';

// --- Écrans Profil & Système ---
import ProfileScreen from '../../screens/Profile/ProfileScreen'; 
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// --- Écrans Partagés (Outils & Support) ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const LawyerStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
    // ✅ Recommandé : Commencer par le Dashboard pour avoir les KPIs du cabinet
    initialRouteName="LawyerHome" 
  >
    {/* ==========================================
        🏠 ACCUEIL & DASHBOARD
    ========================================== */}
    <Stack.Screen name="LawyerHome" component={LawyerHomeScreen} />
    
    {/* ==========================================
        📁 GESTION DES DOSSIERS & RÉPERTOIRE
    ========================================== */}
    <Stack.Screen name="LawyerCaseList" component={LawyerCaseListScreen as any} />
    <Stack.Screen name="LawyerCaseDetail" component={LawyerCaseDetailScreen as any} />
    <Stack.Screen name="LawyerSubmitBrief" component={LawyerSubmitBriefScreen as any} />
    <Stack.Screen name="LawyerTracking" component={LawyerTrackingScreen as any} />
    
    {/* ==========================================
        📅 AGENDA & ALERTES RPVA
    ========================================== */}
    <Stack.Screen name="LawyerCalendar" component={LawyerCalendarScreen as any} />
    <Stack.Screen name="LawyerNotifications" component={LawyerNotificationsScreen as any} />

    {/* ==========================================
        🗺️ CONSULTATION NATIONALE
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />

    {/* ==========================================
        👤 COMPTE, SYSTÈME & NOTIFICATIONS
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={LawyerNotificationsScreen as any} />
    <Stack.Screen name="Settings" component={ProfileScreen} />

    {/* ==========================================
        ℹ️ ASSISTANCE & DOCUMENTATION
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default LawyerStack;