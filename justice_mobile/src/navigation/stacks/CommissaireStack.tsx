import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

import CommissaireDashboard from '../../screens/commissaire/CommissaireDashboard';
import CommissaireVisaList from '../../screens/commissaire/CommissaireVisaList';
import CommissaireGAVSupervisionScreen from '../../screens/commissaire/CommissaireGAVSupervisionScreen';
import CommissaireRegistryScreen from '../../screens/commissaire/CommissaireRegistryScreen';
import CommissaireReviewScreen from '../../screens/commissaire/CommissaireReviewScreen';
import CommissaireActionDetail from '../../screens/commissaire/CommissaireActionDetail';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const CommissaireStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="CommissaireDashboard" component={CommissaireDashboard as any} />
    <Stack.Screen name="CommissaireVisaList" component={CommissaireVisaList as any} />
    {/* ✅ Nom exact dans ParamList : CommissaireGAVSupervision */}
    <Stack.Screen name="CommissaireGAVSupervision" component={CommissaireGAVSupervisionScreen as any} />
    <Stack.Screen name="CommissaireRegistry" component={CommissaireRegistryScreen as any} />
    <Stack.Screen name="CommissaireReview" component={CommissaireReviewScreen as any} />
    <Stack.Screen name="CommissaireActionDetail" component={CommissaireActionDetail as any} />
  </Stack.Navigator>
);
export default CommissaireStack;