import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// --- Écrans Procureur (Parquet) ---
import ProsecutorHomeScreen from '../../screens/prosecutor/ProsecutorHomeScreen';
import ProsecutorCaseListScreen from '../../screens/prosecutor/ProsecutorCaseListScreen';
import ProsecutorCaseDetailScreen from '../../screens/prosecutor/ProsecutorCaseDetailScreen';
import ProsecutorAssignJudgeScreen from '../../screens/prosecutor/ProsecutorAssignJudgeScreen';

// --- Écrans Partagés (Imports Système) ---
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const ProsecutorStack = () => (
  <Stack.Navigator 
    screenOptions={{ headerShown: false }}
    initialRouteName="ProsecutorDashboard"
  >
    {/* ==========================================
        🏛️ DIRECTION DU PARQUET (Métier)
    ========================================== */}
    <Stack.Screen name="ProsecutorDashboard" component={ProsecutorHomeScreen as any} />
    <Stack.Screen name="ProsecutorCaseList" component={ProsecutorCaseListScreen} />
    <Stack.Screen name="ProsecutorCaseDetail" component={ProsecutorCaseDetailScreen as any} />
    <Stack.Screen name="ProsecutorAssignJudge" component={ProsecutorAssignJudgeScreen as any} />

    {/* ==========================================
        👤 COMPTE & SYSTÈME (Header/Footer/Settings)
    ========================================== */}
    <Stack.Screen name="Profile" component={ProfileScreen} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="Settings" component={ProfileScreen} /> 
    <Stack.Screen name="Notifications" component={AdminNotificationsScreen as any} />

    {/* ==========================================
        🗺️ OUTILS TRANSVERSAUX & SOS
    ========================================== */}
    <Stack.Screen name="NationalMap" component={NationalMapScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />

    {/* ==========================================
        ℹ️ SUPPORT, AIDE & TÉLÉCHARGEMENTS
    ========================================== */}
    <Stack.Screen name="UserGuide" component={UserGuideScreen} />
    <Stack.Screen name="Support" component={SupportScreen} />
    <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />

  </Stack.Navigator>
);

export default ProsecutorStack;