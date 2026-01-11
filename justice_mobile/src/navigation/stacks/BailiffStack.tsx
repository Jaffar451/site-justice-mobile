import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BailiffStackParamList } from '../../types/navigation';

// --- 📜 Écrans Métier Huissier ---
import BailiffHomeScreen from '../../screens/bailiff/BailiffHomeScreen';
import BailiffMissionsScreen from '../../screens/bailiff/BailiffMissionsScreen';
import BailiffCalendarScreen from '../../screens/bailiff/BailiffCalendarScreen';

// --- 🌍 Écrans PARTAGÉS (Système & Support) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen'; // Utilisé pour les notifs
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';
import AboutScreen from '../../screens/shared/AboutScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

const Stack = createNativeStackNavigator<BailiffStackParamList>();

export default function BailiffStack() {
  return (
    <Stack.Navigator 
      initialRouteName="BailiffHome" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {/* ==========================================
          📜 ACTIVITÉ HUISSIER
      ========================================== */}
      <Stack.Screen name="BailiffHome" component={BailiffHomeScreen} />
      <Stack.Screen name="BailiffMissions" component={BailiffMissionsScreen} />
      <Stack.Screen name="BailiffCalendar" component={BailiffCalendarScreen} />

      {/* ==========================================
          👤 COMPTE & SYSTÈME
      ========================================== */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />
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