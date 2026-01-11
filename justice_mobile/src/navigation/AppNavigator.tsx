import React, { useEffect } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ✅ Types & Services
import { RootStackParamList } from "../types/navigation";
import { navigationRef } from "./RootNavigation"; 

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
  
  // ⚠️ MODIFICATION : On ne récupère plus 'isHydrating' ici pour ne pas bloquer le rendu.
  // L'écran Splash se chargera d'attendre la fin de l'hydratation.
  const { isAuthenticated, hydrate } = useAuthStore();

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
      // Sécurité : si textSecondary n'existe pas, on utilise une couleur par défaut
      border: (theme.colors as any).textSecondary || theme.colors.primary || '#ccc',
    },
  };

  // ❌ LE BLOC DE CHARGEMENT BLOQUANT (ActivityIndicator) A ÉTÉ SUPPRIMÉ ICI ❌
  // Cela laisse la main au SplashScreen pour l'animation.

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
            // 🚪 ZONE PUBLIQUE (Contient le SplashScreen au démarrage)
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            // 🏛️ ZONE SÉCURISÉE (Redirection par rôle gérée dans DrawerNavigator)
            <Stack.Screen name="Main" component={DrawerNavigator} />
          )}

        </Stack.Navigator>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  // Le style loadingContainer n'est plus utilisé ici, mais on peut le garder au cas où
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});