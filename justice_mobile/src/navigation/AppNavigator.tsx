import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ✅ Types & Services
import { RootStackParamList } from "../types/navigation";
import { navigationRef } from "./RootNavigation"; // 👈 CRUCIAL pour le service de navigation

// ✅ Stores & Système
import { useAuthStore } from "../stores/useAuthStore";
import { useAppTheme } from "../theme/AppThemeProvider";
import { SyncManager } from "../components/SyncManager";

// ✅ Navigateurs
import AuthNavigator from "./AuthNavigator";
import DrawerNavigator from "./DrawerNavigator"; 

// On utilise le typage strict défini dans navigation.ts
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { theme, isDark } = useAppTheme();
  const { isAuthenticated, isHydrating, hydrate } = useAuthStore();

  // 🔄 Hydratation du store (récupération de la session au démarrage)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 🎨 Adaptation du thème React Navigation avec votre thème perso
  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      primary: theme.colors.primary,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.textSecondary,
    },
  };

  // ⌛ Écran de chargement pendant la vérification du token/session
  if (isHydrating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={theme.colors.background}
      />
      
      {/* 🔄 Gestionnaire de synchronisation offline (Hors navigation) */}
      <SyncManager />

      {/* ✅ Ajout de 'ref={navigationRef}' pour permettre la navigation depuis les services */}
      <NavigationContainer ref={navigationRef} theme={navigationTheme}>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade' // Transition douce login/logout
          }}
        >
          
          {!isAuthenticated ? (
            // 🚪 ZONE PUBLIQUE
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            // 🏛️ ZONE SÉCURISÉE (Redirection par rôle gérée dans DrawerNavigator)
            // Note: Le DrawerNavigator doit être capable de recevoir le param 'Main'
            <Stack.Screen name="Main" component={DrawerNavigator} />
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});