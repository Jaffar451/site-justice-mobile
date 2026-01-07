import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Spécifiques Police ---
import PoliceHomeScreen from '../../screens/police/PoliceHomeScreen';
import PoliceComplaintsScreen from '../../screens/police/PoliceComplaintsScreen';
import PoliceComplaintDetailsScreen from '../../screens/police/PoliceComplaintDetailsScreen';
import PoliceCasesScreen from '../../screens/police/PoliceCasesScreen';
import PoliceCustodyScreen from '../../screens/police/PoliceCustodyScreen';
import PoliceCustodyExtensionScreen from '../../screens/police/PoliceCustodyExtensionScreen';
import PolicePVScreen from '../../screens/police/PolicePVScreen';
import CreateSummonScreen from '../../screens/police/CreateSummonScreen';
import PoliceArrestWarrantScreen from '../../screens/police/PoliceArrestWarrantScreen';
import PoliceSearchWarrantScreen from '../../screens/police/PoliceSearchWarrantScreen';
import PoliceInterrogationScreen from '../../screens/police/PoliceInterrogationScreen';
import PoliceDetentionScreen from '../../screens/police/PoliceDetentionScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';

// --- Écrans PARTAGÉS (Requis pour la stabilité du Header/Footer/Système) ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const PoliceStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="PoliceHome"
  >
    {/* ==========================================
        🏠 ACCUEIL & CARTOGRAPHIE SOS
    ========================================== */}
    <Stack.Screen name="PoliceHome" component={PoliceHomeScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} /> 
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />

    {/* ==========================================
        📁 GESTION DES PLAINTES & ENQUÊTES
    ========================================== */}
    <Stack.Screen name="PoliceComplaints" component={PoliceComplaintsScreen as any} />
    <Stack.Screen name="PoliceComplaintDetails" component={PoliceComplaintDetailsScreen as any} />
    <Stack.Screen name="PoliceCases" component={PoliceCasesScreen as any} />
    
    {/* ==========================================
        📝 PROCÉDURES OPJ & AUDITIONS
    ========================================== */}
    <Stack.Screen name="PolicePVScreen" component={PolicePVScreen as any} />
    <Stack.Screen name="PoliceInterrogation" component={PoliceInterrogationScreen as any} />
    <Stack.Screen name="CreateSummon" component={CreateSummonScreen} />
    
    {/* ==========================================
        🔒 MESURES PRIVATIVES DE LIBERTÉ (GAV)
    ========================================== */}
    <Stack.Screen name="PoliceCustody" component={PoliceCustodyScreen as any} />
    <Stack.Screen name="PoliceCustodyExtension" component={PoliceCustodyExtensionScreen as any} />
    <Stack.Screen name="PoliceDetention" component={PoliceDetentionScreen as any} />
    
    {/* ==========================================
        ⚖️ RECHERCHES & MANDATS
    ========================================== */}
    <Stack.Screen name="PoliceArrestWarrant" component={PoliceArrestWarrantScreen} />
    <Stack.Screen name="PoliceSearchWarrant" component={PoliceSearchWarrantScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    
    {/* ==========================================
        👤 COMPTE, NOTIFICATIONS & RÉGLAGES
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    {/* ✅ "Settings" pointe vers Profile pour éviter l'erreur de navigation */}
    <Stack.Screen name="Settings" component={ProfileScreen} /> 
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        ℹ️ ASSISTANCE & TÉLÉCHARGEMENTS
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

  </Stack.Navigator>
);

export default PoliceStack;