import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';

// --- 🏛️ Écrans Gestion des Juridictions ---
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen'; // Stations (Commissariats)
import NationalMapScreen from '../../screens/admin/NationalMapScreen';

// --- 🌍 Écrans PARTAGÉS (Système & Support) ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';
import AboutScreen from '../../screens/shared/AboutScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

// On utilise AdminStackParamList car la gestion des cours est une fonction Admin
const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function CourtStack() {
  return (
    <Stack.Navigator 
      initialRouteName="AdminCourts" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      {/* ==========================================
          🏛️ GESTION DES TRIBUNAUX & STATIONS
      ========================================== */}
      <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
      <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />
      <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
      <Stack.Screen name="NationalMap" component={NationalMapScreen} />

      {/* ==========================================
          👤 COMPTE & SYSTÈME
      ========================================== */}
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      
      {/* Notifications Admin */}
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      {/* Alias pour la navigation partagée */}
      <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

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