import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";
import * as Notifications from 'expo-notifications';

// ✅ UI & Contextes
import { AppThemeProvider } from "./src/theme/AppThemeProvider";
import { SyncManager } from "./src/components/SyncManager"; 
import ToastManager from "./src/components/ui/ToastManager"; 
import { NetworkBanner } from "./src/components/ui/NetworkBanner";

// ✅ Navigation & Store
import AppNavigator from "./src/navigation/AppNavigator";
import { navigationRef } from "./src/navigation/RootNavigation"; 
import { useAuthStore } from "./src/stores/useAuthStore";
import { registerForPushNotificationsAsync } from "./src/services/notification.service";

// 🔔 Configuration globale des notifications (Primordial pour le SOS)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

export default function App() {
  const { hydrate, user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  
  // ✅ CORRECTION : Utilisation du type spécifique à expo-notifications
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    async function initialize() {
      try {
        // Hydratation des données utilisateurs (Zustand)
        await hydrate();
      } catch (error) {
        console.error("App - [ERROR] Hydratation:", error);
      } finally {
        setIsReady(true);
      }
    }
    initialize();

    // 🚨 GESTION DES NOTIFICATIONS SOS (Réception quand l'app est ouverte)
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("App - [SOS] Alerte reçue en direct:", notification.request.content.data);
    });

    // 🚨 GESTION DU CLIC (Ouverture de l'écran SOS depuis la bannière)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data as { screen?: string, sosId?: string };
      
      if (data?.screen && navigationRef.isReady()) {
        // @ts-ignore - Redirection vers l'écran SOS via la navigationRef (RootNavigation)
        navigationRef.navigate(data.screen, { sosId: data.sosId });
      }
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [hydrate]);

  // ✅ Enregistrement du Token Push (Uniquement si l'utilisateur est authentifié)
  useEffect(() => {
    if (isReady && user) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          console.log("App - [INFO] Token Push actif pour les SOS");
        }
      });
    }
  }, [isReady, user]);

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
            <NetworkBanner />
            <SyncManager />
            <StatusBar style="auto" translucent />
            
            {/* ✅ AppNavigator gère maintenant la navigationRef via RootNavigation */}
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