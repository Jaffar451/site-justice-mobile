// PATH: src/navigation/stacks/StationStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';

// --- 🏢 Écrans Admin / Unités (Logistique) ---
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// --- 🌍 Écrans Communs & Support ---
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import AboutScreen from '../../screens/shared/AboutScreen';

// --- 🚨 Écrans Transversaux (Police/Urgence) ---
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';

// --- ℹ️ Support ---
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

// ✅ CORRECTION TYPAGE : Création d'un type local hybride
// Cela permet d'inclure les routes Admin + les exceptions (WarrantSearch, SosDetail)
type StationStackParams = AdminStackParamList & {
  WarrantSearch: undefined;
  SosDetail: { alert: any };
};

const Stack = createNativeStackNavigator<StationStackParams>();

export const StationStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
    initialRouteName="ManageStations"
  >
    {/* ==========================================
        🏢 GESTION DU TERRITOIRE & UNITÉS
    ========================================== */}
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen} />

    {/* ==========================================
        👥 AGENTS ET RESSOURCES HUMAINES
    ========================================== */}
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />

    {/* ==========================================
        📊 ANALYSE ET PERFORMANCE GÉOGRAPHIQUE
    ========================================== */}
    <Stack.Screen name="AdminStats" component={AdminStatsScreen} />

    {/* ==========================================
        👤 COMPTE & SYSTÈME
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={SettingsScreen} /> 
    
    {/* AdminNotifications est compatible avec le type Admin */}
    <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
    {/* Alias pour la navigation partagée */}
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ OUTILS TRANSVERSAUX & SOS
    ========================================== */}
    {/* ✅ Plus d'erreur ici grâce au type StationStackParams */}
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />

    {/* ==========================================
        ℹ️ SUPPORT, AIDE & TÉLÉCHARGEMENTS
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="HelpCenter" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="About" component={AboutScreen} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

  </Stack.Navigator>
);

export default StationStack;