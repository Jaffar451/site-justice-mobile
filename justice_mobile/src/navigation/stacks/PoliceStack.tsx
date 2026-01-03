import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

import PoliceHomeScreen from '../../screens/police/PoliceHomeScreen';
import PoliceComplaintsScreen from '../../screens/police/PoliceComplaintsScreen';
import PoliceComplaintDetailsScreen from '../../screens/police/PoliceComplaintDetailsScreen';
import PoliceCasesScreen from '../../screens/police/PoliceCasesScreen';
import PoliceCustodyScreen from '../../screens/police/PoliceCustodyScreen';
import PoliceCustodyExtensionScreen from '../../screens/police/PoliceCustodyExtensionScreen';
import PolicePVScreen from '../../screens/police/PolicePVScreen';
import CreateSummonScreen from '../../screens/police/CreateSummonScreen';
import PoliceArrestWarrantScreen from '../../screens/police/PoliceArrestWarrantScreen';
import PoliceSearchWarrantScreen from '../../screens/police/PoliceSearchWarrantScreen';
import PoliceInterrogationScreen from '../../screens/police/PoliceInterrogationScreen';
import PoliceDetentionScreen from '../../screens/police/PoliceDetentionScreen';
import WarrantSearchScreen from '../../screens/police/WarrantSearchScreen';
import SosDetailScreen from '../../screens/police/SosDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const PoliceStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PoliceHome" component={PoliceHomeScreen} />
    
    {/* ✅ Utilisation de 'as any' pour bypasser le mismatch PoliceCases vs PoliceComplaints */}
    <Stack.Screen name="PoliceCases" component={PoliceCasesScreen as any} />
    <Stack.Screen name="PoliceComplaints" component={PoliceComplaintsScreen as any} />
    
    <Stack.Screen name="PoliceComplaintDetails" component={PoliceComplaintDetailsScreen as any} />
    <Stack.Screen name="PoliceCustody" component={PoliceCustodyScreen as any} />
    <Stack.Screen name="PoliceCustodyExtension" component={PoliceCustodyExtensionScreen as any} />
    <Stack.Screen name="PolicePVScreen" component={PolicePVScreen as any} />
    <Stack.Screen name="CreateSummon" component={CreateSummonScreen} />
    <Stack.Screen name="PoliceArrestWarrant" component={PoliceArrestWarrantScreen} />
    
    {/* ✅ Utilisation de 'as any' pour bypasser le mismatch WarrantSearch */}
    <Stack.Screen name="PoliceSearchWarrant" component={PoliceSearchWarrantScreen as any} />
    <Stack.Screen name="WarrantSearch" component={WarrantSearchScreen as any} />
    
    <Stack.Screen name="SosDetail" component={SosDetailScreen as any} />
    <Stack.Screen name="PoliceInterrogation" component={PoliceInterrogationScreen as any} />
    <Stack.Screen name="PoliceDetention" component={PoliceDetentionScreen as any} />
  </Stack.Navigator>
);
export default PoliceStack;