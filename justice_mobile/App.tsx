import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

// ✅ UI & Contextes thématiques
import { AppThemeProvider } from "./src/theme/AppThemeProvider";
import { SyncManager } from "./src/components/SyncManager"; 
import ToastManager from "./src/components/ui/ToastManager"; 
import { NetworkBanner } from "./src/components/ui/NetworkBanner";

// ✅ Navigation & Store (Migration Zustand terminée)
import AppNavigator from "./src/navigation/AppNavigator";
import { useAuthStore } from "./src/stores/useAuthStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, 
    },
  },
});

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);
  const [isReady, setIsReady] = useState(false);

  /**
   * 🛡️ INITIALISATION SÉCURISÉE
   * Charge les sessions (Police, Justice, Citoyen) depuis le stockage sécurisé.
   */
  useEffect(() => {
    async function initialize() {
      try {
        // Hydratation du store Zustand (remplace l'ancien AuthContext)
        await hydrate();
      } catch (error) {
        console.error("App - [ERROR] Échec de l'initialisation:", error);
      } finally {
        setIsReady(true);
      }
    }
    initialize();
  }, [hydrate]); 

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A237E" />
        <Text style={styles.loadingText}>RÉPUBLIQUE DU NIGER</Text>
        <Text style={styles.subLoadingText}>Système e-Justice • Chargement sécurisé...</Text>
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider> 
        <AppThemeProvider>
          <PaperProvider>
            {/* ✅ L'AuthProvider a été supprimé car useAuthStore est global */}
            <NetworkBanner />
            <SyncManager />
            <StatusBar style="auto" translucent />
            
            <AppNavigator />
            
            <ToastManager />
          </PaperProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#FFFFFF" 
  },
  loadingText: { 
    marginTop: 20, 
    fontSize: 14, 
    color: "#1A237E", 
    fontWeight: "900",
    letterSpacing: 3, 
    textAlign: 'center'
  },
  subLoadingText: {
    marginTop: 10,
    fontSize: 12,
    color: "#64748B",
    fontWeight: "500"
  }
});