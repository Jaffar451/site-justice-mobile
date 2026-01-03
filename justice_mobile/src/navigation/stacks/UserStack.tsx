import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AdminUsersScreen from '../../screens/admin/AdminUsersScreen';
import AdminCreateUserScreen from '../../screens/admin/AdminCreateUserScreen';
import AdminUserDetailsScreen from '../../screens/admin/AdminUserDetailsScreen';
import AdminEditUserScreen from '../../screens/admin/AdminEditUserScreen';

export type UserStackParamList = {
  AdminUsers: undefined;
  AdminCreateUser: undefined;
  AdminUserDetails: { userId: number };
  AdminEditUser: { userId: number };
};

const Stack = createNativeStackNavigator<UserStackParamList>();

export const UserStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
    <Stack.Screen name="AdminCreateUser" component={AdminCreateUserScreen} />
    <Stack.Screen name="AdminUserDetails" component={AdminUserDetailsScreen} />
    <Stack.Screen name="AdminEditUser" component={AdminEditUserScreen} />
  </Stack.Navigator>
);
export default UserStack;