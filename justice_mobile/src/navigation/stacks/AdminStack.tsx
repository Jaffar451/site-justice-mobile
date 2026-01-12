import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AdminStackParamList } from '../../types/navigation';

// ==========================================
// IMPORTS
// ==========================================

// 1. Admin Core
import AdminHomeScreen from '../../screens/admin/AdminHomeScreen';
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';

// 2. Admin Structures
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';

// 3. Admin Tools & Tech
import NationalMapScreen from '../../screens/admin/NationalMapScreen';
import AdminStatsScreen from '../../screens/admin/AdminStatsScreen';
import AdminAuditTrailScreen from '../../screens/admin/AdminAuditTrailScreen';
import AdminLogsScreen from '../../screens/admin/AdminLogsScreen';
import AdminSettingsScreen from '../../screens/admin/AdminSettingsScreen';
import AdminMaintenanceScreen from '../../screens/admin/AdminMaintenanceScreen';
import AdminSecurityScreen from '../../screens/admin/AdminSecurityScreen';
import AdminEditProfileScreen from '../../screens/admin/AdminEditProfileScreen';

// 4. Shared Screens
import VerificationScannerScreen from '../../screens/shared/VerificationScannerScreen';
import WeeklyReportScreen from '../../screens/shared/WeeklyReportScreen';
import UserGuideScreen from '../../screens/shared/UserGuideScreen';
import SupportScreen from '../../screens/shared/SupportScreen';
import AboutScreen from '../../screens/shared/AboutScreen';
import MyDownloadsScreen from '../../screens/citizen/MyDownloadsScreen';

// 5. Shared Profile & Settings
import ProfileScreen from '../../screens/Profile/ProfileScreen';
import EditProfileScreen from '../../screens/Profile/EditProfileScreen';
import SettingsScreen from '../../screens/Settings/SettingsScreen';
import AdminNotificationsScreen from '../../screens/admin/AdminNotificationsScreen';

// TYPAGE
type AdminStackParams = AdminStackParamList & {
  VerificationScanner: undefined;
  WeeklyReport: undefined;
  Notifications: undefined;
  HelpCenter: undefined;
  AdminLogs: undefined;
  AdminSecurity: undefined;
  AdminMaintenance: undefined;
  AdminEditProfile: undefined;
  AdminHome: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParams>();

export default function AdminStack() {
  return (
    <Stack.Navigator 
      initialRouteName="AdminDashboard" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="AdminDashboard" component={AdminHomeScreen} />
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} />
      
      <Stack.Screen name="AdminMaintenance" component={AdminMaintenanceScreen} />
      <Stack.Screen name="AdminLogs" component={AdminLogsScreen} />
      <Stack.Screen name="AdminSecurity" component={AdminSecurityScreen} />

      <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      <Stack.Screen name="AdminUserDetail" component={AdminUserDetailsScreen} />
      <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
      <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen} />
      
      <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
      <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />
      <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
      
      <Stack.Screen name="NationalMap" component={NationalMapScreen} />
      <Stack.Screen name="AdminStats" component={AdminStatsScreen} />
      <Stack.Screen name="AdminAudit" component={AdminAuditTrailScreen} />
      <Stack.Screen name="AdminSettings" component={AdminSettingsScreen} />

      <Stack.Screen name="VerificationScanner" component={VerificationScannerScreen as any} />
      <Stack.Screen name="WeeklyReport" component={WeeklyReportScreen as any} />

      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AdminEditProfile" component={AdminEditProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />

      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="AdminNotifications" component={AdminNotificationsScreen} />
      <Stack.Screen name="Notifications" component={AdminNotificationsScreen} />

      <Stack.Screen name="UserGuide" component={UserGuideScreen} />
      <Stack.Screen name="HelpCenter" component={UserGuideScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="MyDownloads" component={MyDownloadsScreen} />
    </Stack.Navigator>
  );
}