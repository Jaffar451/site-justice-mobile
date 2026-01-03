import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ✅ Types
import { RootStackParamList } from "../types/navigation";

// ✅ Stores & Composants Système
import { useAuthStore } from "../stores/useAuthStore";
import { SyncManager } from "../components/SyncManager";

// ✅ Navigateurs
import AuthNavigator from "./AuthNavigator";
import DrawerNavigator from "./DrawerNavigator"; // 👈 C'est lui qui gère tout le reste !

// On utilise 'any' ici temporairement si vous n'avez pas encore ajouté "Main" dans vos types,
// sinon gardez <RootStackParamList>
const Stack = createNativeStackNavigator<any>();

export default function AppNavigator() {
  const { isAuthenticated, isHydrating, hydrate } = useAuthStore();

  // Hydratation de la session au démarrage
  useEffect(() => {
    hydrate();
  }, []);

  // Écran de chargement (Splash technique)
  if (isHydrating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* 📡 Le SyncManager tourne en fond ici */}
      <SyncManager />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {!isAuthenticated ? (
            // 🚪 CAS 1 : NON CONNECTÉ -> On affiche les écrans de Login/Register
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            // 🏛️ CAS 2 : CONNECTÉ -> On délègue tout au Drawer (Menu Latéral)
            // Le Drawer contient déjà AdminHome, PoliceHome, AdminLogs, etc.
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
    backgroundColor: "#F8FAFC",
  }
});