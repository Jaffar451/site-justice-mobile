import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

// 🔐 Écrans Auth
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";

// Import du type centralisé
import { AuthStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login"
      screenOptions={{ 
        headerShown: false, 
        // 🚀 Optimisation Web : 'none' évite les bugs de flickering lors des redirections rapides
        animation: Platform.OS === 'web' ? 'none' : 'fade',
        contentStyle: { backgroundColor: '#FFFFFF' },
        // Empêche le retour en arrière vers le splash screen s'il y en a un
        gestureEnabled: false, 
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{
          // Sur le Web, on peut vouloir désactiver complètement les transitions pour le login
          animationTypeForReplace: 'pop',
        }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}