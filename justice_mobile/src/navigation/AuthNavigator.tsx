// PATH: src/navigation/AuthNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform } from "react-native";

// 🔐 Écrans Auth
import SplashScreen from "../screens/Auth/SplashScreen"; // ✅ Ajouté (présent dans ton dossier)
import LoginScreen from "../screens/Auth/LoginScreen";
import RegisterScreen from "../screens/Auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/Auth/ForgotPasswordScreen";

import { AuthStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator 
      initialRouteName="Login" // Tu peux changer en "Splash" si tu veux l'écran de bienvenue en premier
      screenOptions={{ 
        headerShown: false, 
        animation: Platform.OS === 'web' ? 'none' : 'fade',
        contentStyle: { backgroundColor: '#FFFFFF' },
        gestureEnabled: false, 
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ animationTypeForReplace: 'pop' }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </Stack.Navigator>
  );
}