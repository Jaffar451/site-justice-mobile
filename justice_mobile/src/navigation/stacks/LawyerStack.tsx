import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Avocat (Lawyer) ---
import LawyerCaseListScreen from '../../screens/lawyer/LawyerCaseListScreen';
import LawyerCaseDetailScreen from '../../screens/lawyer/LawyerCaseDetailScreen';
import LawyerCalendarScreen from '../../screens/lawyer/LawyerCalendarScreen';
import LawyerTrackingScreen from '../../screens/lawyer/LawyerTrackingScreen';
import LawyerNotificationsScreen from '../../screens/lawyer/LawyerNotificationsScreen';
import LawyerSubmitBriefScreen from '../../screens/lawyer/LawyerSubmitBriefScreen';

// --- Écrans Communs & Partagés ---
import ProfileScreen from '../../screens/Profile/ProfileScreen'; // ✅ Requis par AppHeader
import NationalMapScreen from '../../screens/admin/NationalMapScreen'; // ✅ Pour voir les alertes publiques

const Stack = createNativeStackNavigator<RootStackParamList>();

export const LawyerStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="LawyerTracking" // ✅ On définit l'accueil avocat sur le suivi
  >
    {/* ==========================================
        📈 TABLEAU DE BORD & SUIVI (Dashboard)
    ========================================== */}
    <Stack.Screen name="LawyerTracking" component={LawyerTrackingScreen as any} />
    
    {/* ==========================================
        📁 GESTION DES DOSSIERS
    ========================================== */}
    <Stack.Screen name="LawyerCaseList" component={LawyerCaseListScreen as any} />
    <Stack.Screen name="LawyerCaseDetail" component={LawyerCaseDetailScreen as any} />
    <Stack.Screen name="LawyerSubmitBrief" component={LawyerSubmitBriefScreen as any} />

    {/* ==========================================
        📅 AGENDA & NOTIFICATIONS
    ========================================== */}
    <Stack.Screen name="LawyerCalendar" component={LawyerCalendarScreen as any} />
    <Stack.Screen name="LawyerNotifications" component={LawyerNotificationsScreen as any} />

    {/* ==========================================
        🗺️ CONSULTATION NATIONALE
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />

    {/* ==========================================
        👤 COMPTE & PARAMÈTRES (Requis par AppHeader)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />

  </Stack.Navigator>
);

export default LawyerStack;