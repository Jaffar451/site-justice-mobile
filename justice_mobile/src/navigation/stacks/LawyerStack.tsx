import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

// ✅ Ajout des imports manquants
import LawyerCaseListScreen from '../../screens/lawyer/LawyerCaseListScreen';
import LawyerCaseDetailScreen from '../../screens/lawyer/LawyerCaseDetailScreen';
import LawyerCalendarScreen from '../../screens/lawyer/LawyerCalendarScreen';
import LawyerTrackingScreen from '../../screens/lawyer/LawyerTrackingScreen';
import LawyerNotificationsScreen from '../../screens/lawyer/LawyerNotificationsScreen';
import LawyerSubmitBriefScreen from '../../screens/lawyer/LawyerSubmitBriefScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const LawyerStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="LawyerCaseList" component={LawyerCaseListScreen} />
    <Stack.Screen name="LawyerCaseDetail" component={LawyerCaseDetailScreen} />
    <Stack.Screen name="LawyerCalendar" component={LawyerCalendarScreen} />
    <Stack.Screen name="LawyerTracking" component={LawyerTrackingScreen} />
    <Stack.Screen name="LawyerNotifications" component={LawyerNotificationsScreen} />
    <Stack.Screen name="LawyerSubmitBrief" component={LawyerSubmitBriefScreen} />
  </Stack.Navigator>
);
export default LawyerStack;