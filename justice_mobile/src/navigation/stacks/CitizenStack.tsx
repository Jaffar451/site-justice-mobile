// PATH: src/navigation/stacks/CitizenStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Citoyens (Métier) ---
import CitizenHomeScreen from '../../screens/citizen/CitizenHomeScreen';
import CitizenCreateComplaintScreen from '../../screens/citizen/CitizenCreateComplaintScreen';
import CitizenEditComplaintScreen from '../../screens/citizen/CitizenEditComplaintScreen';
import CitizenMyComplaintsScreen from '../../screens/citizen/CitizenMyComplaintsScreen';
import CitizenCasesScreen from '../../screens/citizen/CitizenCasesScreen';
import CitizenComplaintDetailsScreen from '../../screens/citizen/CitizenComplaintDetailsScreen';
import CitizenTrackingScreen from '../../screens/citizen/CitizenTrackingScreen';
import CitizenCriminalRecordScreen from '../../screens/citizen/CitizenCriminalRecordScreen';
import CitizenDirectoryScreen from '../../screens/citizen/CitizenDirectoryScreen';
import StationMapScreen from '../../screens/citizen/StationMapScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

// --- Écrans Profil & Notifications ---
import ProfileScreen from '../../screens/Profile/ProfileScreen'; 
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import NotificationsScreen from '../../screens/admin/AdminNotificationsScreen'; 

// --- Écrans Partagés (Système & Support) ---
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CitizenStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right' // Transition fluide standard
    }} 
    initialRouteName="CitizenHome"
  >
    {/* ==========================================
        🏠 ACCUEIL & PORTAIL
    ========================================== */}
    <Stack.Screen name="CitizenHome" component={CitizenHomeScreen} />
    
    {/* ==========================================
        📂 GESTION DES PLAINTES & DOSSIERS
    ========================================== */}
    <Stack.Screen name="CitizenCreateComplaint" component={CitizenCreateComplaintScreen} />
    <Stack.Screen name="CitizenEditComplaint" component={CitizenEditComplaintScreen as any} />
    <Stack.Screen name="CitizenMyComplaints" component={CitizenMyComplaintsScreen as any} />
    <Stack.Screen name="CitizenComplaintDetails" component={CitizenComplaintDetailsScreen as any} />
    <Stack.Screen name="CitizenCases" component={CitizenCasesScreen as any} />
    <Stack.Screen name="CitizenTracking" component={CitizenTrackingScreen as any} />
    <Stack.Screen name="CitizenCriminalRecord" component={CitizenCriminalRecordScreen} />
    
    {/* ==========================================
        🗺️ ORIENTATION & TÉLÉCHARGEMENTS
    ========================================== */}
    <Stack.Screen name="CitizenDirectory" component={CitizenDirectoryScreen as any} />
    <Stack.Screen name="StationMapScreen" component={StationMapScreen} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

    {/* ==========================================
        👤 COMPTE, SYSTÈME & NOTIFICATIONS
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={NotificationsScreen as any} />
    <Stack.Screen name="Settings" component={ProfileScreen} />

    {/* ==========================================
        ℹ️ ASSISTANCE & DOCUMENTATION
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
  </Stack.Navigator>
);

export default CitizenStack;