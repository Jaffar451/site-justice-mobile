import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManageStationsScreen from '../../screens/admin/ManageStationsScreen';
import NationalMapScreen from '../../screens/admin/NationalMapScreen';

export type StationStackParamList = {
  ManageStations: undefined;
  NationalMap: undefined;
};

const Stack = createNativeStackNavigator<StationStackParamList>();

export const StationStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ManageStations" component={ManageStationsScreen} />
    <Stack.Screen name="NationalMap" component={NationalMapScreen} />
  </Stack.Navigator>
);
export default StationStack;