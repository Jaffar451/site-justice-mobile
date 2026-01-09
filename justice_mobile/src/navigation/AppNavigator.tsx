// PATH: src/navigation/AppNavigator.tsx
import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ✅ Stores & Système
import { useAuthStore } from "../stores/useAuthStore";
import { useAppTheme } from "../theme/AppThemeProvider";
import { SyncManager } from "../components/SyncManager";

// ✅ Navigateurs
import AuthNavigator from "./AuthNavigator";
import DrawerNavigator from "./DrawerNavigator"; 

const Stack = createNativeStackNavigator<any>();

export default function AppNavigator() {
  const { theme, isDark } = useAppTheme();
  const { isAuthenticated, isHydrating, hydrate } = useAuthStore();

  // 🔄 Hydratation du store (récupération de la session au démarrage)
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // ⌛ Écran de chargement pendant la vérification du token/session
  if (isHydrating) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* 🔄 Gestionnaire de synchronisation offline (Hors navigation) */}
      <SyncManager />

      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            animation: 'fade' // Transition douce lors du changement d'état auth
          }}
        >
          
          {!isAuthenticated ? (
            // 🚪 ZONE PUBLIQUE (Login, Inscription, Mot de passe oublié)
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            // 🏛️ ZONE SÉCURISÉE (Le coeur de l'application)
            // Le DrawerNavigator contient la logique de redirection par rôle.
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