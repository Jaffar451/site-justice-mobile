import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

import ProsecutorHomeScreen from '../../screens/prosecutor/ProsecutorHomeScreen';
import ProsecutorCaseListScreen from '../../screens/prosecutor/ProsecutorCaseListScreen';
import ProsecutorCaseDetailScreen from '../../screens/prosecutor/ProsecutorCaseDetailScreen';
import ProsecutorAssignJudgeScreen from '../../screens/prosecutor/ProsecutorAssignJudgeScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const ProsecutorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    {/* ✅ Dans ParamList c'est ProsecutorDashboard */}
    <Stack.Screen name="ProsecutorDashboard" component={ProsecutorHomeScreen as any} />
    <Stack.Screen name="ProsecutorCaseList" component={ProsecutorCaseListScreen} />
    <Stack.Screen name="ProsecutorCaseDetail" component={ProsecutorCaseDetailScreen as any} />
    <Stack.Screen name="ProsecutorAssignJudge" component={ProsecutorAssignJudgeScreen as any} />
  </Stack.Navigator>
);
export default ProsecutorStack;