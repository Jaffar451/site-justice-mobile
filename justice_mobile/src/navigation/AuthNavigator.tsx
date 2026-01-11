import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../types/navigation';

// --- Écrans d'Authentification ---
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import SplashScreen from '../screens/Auth/SplashScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <Stack.Navigator 
      initialRouteName="Splash" 
      screenOptions={{ 
        headerShown: false,
        animation: 'fade' // Transition douce pour l'auth
      }}
    >
      {/* 💧 SPLASH SCREEN 
          Vérifie si l'utilisateur est déjà connecté au lancement 
      */}
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* 🔐 CONNEXION 
      */}
      <Stack.Screen name="Login" component={LoginScreen} />

      {/* 📝 INSCRIPTION 
      */}
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* 🔑 MOT DE PASSE OUBLIÉ 
      */}
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      
    </Stack.Navigator>
  );
};

export default AuthNavigator;