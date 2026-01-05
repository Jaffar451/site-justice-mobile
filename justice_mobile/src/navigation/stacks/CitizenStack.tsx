// PATH: src/navigation/stacks/CitizenStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// Écrans Citoyens
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

// ✅ AJOUT : L'écran "Mes Téléchargements"
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

// Écrans Communs
import ProfileScreen from '../../screens/Profile/ProfileScreen'; 
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen'; 

// Écrans partagés
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CitizenStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* Accueil */}
    <Stack.Screen name="CitizenHome" component={CitizenHomeScreen} />
    
    {/* Plaintes */}
    <Stack.Screen name="CitizenCreateComplaint" component={CitizenCreateComplaintScreen} />
    <Stack.Screen name="CitizenEditComplaint" component={CitizenEditComplaintScreen as any} />
    <Stack.Screen name="CitizenMyComplaints" component={CitizenMyComplaintsScreen as any} />
    <Stack.Screen name="CitizenCases" component={CitizenCasesScreen as any} />
    <Stack.Screen name="CitizenComplaintDetails" component={CitizenComplaintDetailsScreen as any} />
    <Stack.Screen name="ComplaintDetail" component={CitizenComplaintDetailsScreen as any} />
    
    {/* Services */}
    <Stack.Screen name="CitizenTracking" component={CitizenTrackingScreen as any} />
    <Stack.Screen name="CitizenCriminalRecord" component={CitizenCriminalRecordScreen} />
    
    {/* Cartographie, Annuaire & Téléchargements */}
    <Stack.Screen name="CitizenDirectory" component={CitizenDirectoryScreen as any} />
    <Stack.Screen name="HelpCenter" component={CitizenDirectoryScreen as any} />
    <Stack.Screen name="StationMapScreen" component={StationMapScreen} />
    
    {/* ✅ NOUVELLE ROUTE : Mes Fichiers */}
    <Stack.Screen 
      name="MyDownloads" 
      component={MyDownloadsScreen} 
      options={{ animation: 'slide_from_right' }}
    />

    {/* Profil & Notifications */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen} />

    {/* Support & Guide */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

    {/* Route "Settings" pour le Footer */}
    <Stack.Screen name="Settings" component={ProfileScreen} />
  </Stack.Navigator>
);

export default CitizenStack;