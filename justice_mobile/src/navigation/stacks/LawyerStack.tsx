import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LawyerStackParamList } from '../../types/navigation';

// --- ⚖️ Écrans Métier Avocat ---
import LawyerHomeScreen from '../../screens/lawyer/LawyerHomeScreen';
import LawyerCaseListScreen from '../../screens/lawyer/LawyerCaseListScreen';
import LawyerCaseDetailScreen from '../../screens/lawyer/LawyerCaseDetailScreen';
import LawyerCalendarScreen from '../../screens/lawyer/LawyerCalendarScreen';
import LawyerNotificationsScreen from '../../screens/lawyer/LawyerNotificationsScreen';
import LawyerSubmitBriefScreen from '../../screens/lawyer/LawyerSubmitBriefScreen';
import LawyerTrackingScreen from '../../screens/lawyer/LawyerTrackingScreen';

// --- 🌍 Écrans PARTAGÉS (Système & Support) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';
import AboutScreen from '../../screens/shared/AboutScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

const Stack = createNativeStackNavigator<LawyerStackParamList>();

export default function LawyerStack() {
  return (
    <Stack.Navigator 
      initialRouteName="LawyerHome" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {/* ==========================================
          ⚖️ CABINET & DOSSIERS
      ========================================== */}
      <Stack.Screen name="LawyerHome" component={LawyerHomeScreen} />
      <Stack.Screen name="LawyerCaseList" component={LawyerCaseListScreen} />
      <Stack.Screen name="LawyerCaseDetail" component={LawyerCaseDetailScreen} />
      <Stack.Screen name="LawyerSubmitBrief" component={LawyerSubmitBriefScreen} />

      {/* ==========================================
          📅 AGENDA & SUIVI
      ========================================== */}
      <Stack.Screen name="LawyerCalendar" component={LawyerCalendarScreen} />
      <Stack.Screen name="LawyerTracking" component={LawyerTrackingScreen} />
      
      {/* Notifications Spécifiques Avocat */}
      <Stack.Screen name="LawyerNotifications" component={LawyerNotificationsScreen} />
      {/* Alias pour la navigation partagée vers l'écran de notif avocat */}
      <Stack.Screen name="Notifications" component={LawyerNotificationsScreen as any} />

      {/* ==========================================
          👤 COMPTE & SYSTÈME
      ========================================== */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="NationalMap" component={NationalMapScreen} />

      {/* ==========================================
          ℹ️ AIDE & RESSOURCES
      ========================================== */}
      <Stack.Screen name="UserGuide" component={UserGuideScreen} />
      <Stack.Screen name="HelpCenter" component={UserGuideScreen} /> {/* Alias */}
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    </Stack.Navigator>
  );
}