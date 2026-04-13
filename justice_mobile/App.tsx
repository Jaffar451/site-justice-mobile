import React, { useEffect, useState, useRef } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Platform } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as PaperProvider } from "react-native-paper";
import { StatusBar } from "expo-status-bar";

// Import typé sans risque pour le Web
import type { Notification, NotificationResponse, Subscription } from 'expo-notifications';

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

// 🔔 Initialisation conditionnelle
let Notifications: any = null;
if (Platform.OS !== 'web') {
  Notifications = require('expo-notifications');
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
});

export default function App() {
  const { user } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  
  const notificationListener = useRef<Subscription | null>(null);
  const responseListener = useRef<Subscription | null>(null);

  useEffect(() => {
    // Initialisation simple
    setIsReady(true);

    // 🚨 GESTION DES NOTIFICATIONS : Uniquement Mobile
    if (Platform.OS !== 'web' && Notifications) {
      notificationListener.current = Notifications.addNotificationReceivedListener((notification: Notification) => {
        console.log("Alerte reçue:", notification.request.content.data);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener((response: NotificationResponse) => {
        const data = response.notification.request.content.data as { screen?: string, sosId?: string };
        if (data?.screen && navigationRef.isReady()) {
          navigationRef.navigate(data.screen as any, { sosId: data.sosId });
        }
      });
    }

    return () => {
      if (Platform.OS !== 'web' && Notifications) {
        notificationListener.current?.remove();
        responseListener.current?.remove();
      }
    };
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1A237E" />
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
            <StatusBar style="auto" />
            <AppNavigator /> 
            <ToastManager />
          </PaperProvider>
        </AppThemeProvider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" }
});