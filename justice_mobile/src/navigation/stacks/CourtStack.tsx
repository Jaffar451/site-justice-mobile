import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminCourtsScreen from '../../screens/admin/AdminCourtsScreen';
import AdminCreateCourtScreen from '../../screens/admin/AdminCreateCourtScreen';

export type CourtStackParamList = {
  AdminCourts: undefined;
  AdminCreateCourt: undefined;
};

const Stack = createNativeStackNavigator<CourtStackParamList>();

export const CourtStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminCourts" component={AdminCourtsScreen} />
    <Stack.Screen name="AdminCreateCourt" component={AdminCreateCourtScreen} />
  </Stack.Navigator>
);
export default CourtStack;