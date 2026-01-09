// PATH: src/navigation/stacks/CommissaireStack.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Commissaire (Commandement) ---
import CommissaireDashboard from '../../screens/commissaire/CommissaireDashboard';
import CommissaireVisaList from '../../screens/commissaire/CommissaireVisaList';
import CommissaireGAVSupervisionScreen from '../../screens/commissaire/CommissaireGAVSupervisionScreen';
import CommissaireRegistryScreen from '../../screens/commissaire/CommissaireRegistryScreen';
import CommissaireReviewScreen from '../../screens/commissaire/CommissaireReviewScreen';
import CommissaireActionDetail from '../../screens/commissaire/CommissaireActionDetail';
import CommissaireCommandCenter from '../../screens/commissaire/CommissaireCommandCenter';

// --- Écrans Profil & Notifications ---
import ProfileScreen from '../../screens/Profile/ProfileScreen'; 
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// --- Écrans Partagés (Système & Support) ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen'; 
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen'; 
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CommissaireStack = () => (
  <Stack.Navigator 
    screenOptions={{ 
      headerShown: false,
      animation: 'slide_from_right'
    }}
    initialRouteName="CommissaireDashboard"
  >
    {/* ==========================================
        📈 DIRECTION & PILOTAGE UNITÉ
    ========================================== */}
    <Stack.Screen name="CommissaireDashboard" component={CommissaireDashboard as any} />
    <Stack.Screen name="CommissaireCommandCenter" component={CommissaireCommandCenter as any} />
    
    {/* ==========================================
        🛡️ VALIDATION (VISAS) & RÉVISION
    ========================================== */}
    <Stack.Screen name="CommissaireVisaList" component={CommissaireVisaList as any} />
    <Stack.Screen name="CommissaireReview" component={CommissaireReviewScreen as any} />
    <Stack.Screen name="CommissaireActionDetail" component={CommissaireActionDetail as any} />

    {/* ==========================================
        🔒 SUPERVISION OPÉRATIONNELLE (GAV)
    ========================================== */}
    <Stack.Screen name="CommissaireGAVSupervision" component={CommissaireGAVSupervisionScreen as any} />
    <Stack.Screen name="CommissaireRegistry" component={CommissaireRegistryScreen as any} />

    {/* ==========================================
        🔍 CONTRÔLE TERRITORIAL & RECHERCHE
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />

    {/* ==========================================
        👤 COMPTE, SYSTÈME & NOTIFICATIONS
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        ℹ️ ASSISTANCE & SUPPORT MJ
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />

  </Stack.Navigator>
);

export default CommissaireStack;