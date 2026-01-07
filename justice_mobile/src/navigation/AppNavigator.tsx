import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// ✅ Stores & Composants
import { useAuthStore } from "../stores/useAuthStore";
import { SyncManager } from "../components/SyncManager";

// ✅ Navigateurs & Stacks
import AuthNavigator from "./AuthNavigator";
import DrawerNavigator from "./DrawerNavigator"; 

// ✅ Imports de vos Stacks de Rôles (Pour permettre la redirection .replace)
import AdminStack from "./stacks/AdminStack";
import PoliceStack from "./stacks/PoliceStack";
import JudgeStack from "./stacks/JudgeStack";
import ProsecutorStack from "./stacks/ProsecutorStack";
import CitizenStack from "./stacks/CitizenStack";
import ClerkStack from "./stacks/ClerkStack";
import CommissaireStack from "./stacks/CommissaireStack";
import LawyerStack from "./stacks/LawyerStack";

const Stack = createNativeStackNavigator<any>();

export default function AppNavigator() {
  const { isAuthenticated, isHydrating, hydrate, user } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (isHydrating) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SyncManager />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          
          {!isAuthenticated ? (
            // 🚪 ZONE PUBLIQUE
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            // 🏛️ ZONE SÉCURISÉE
            <>
              {/* Le Main (Drawer) est l'entrée par défaut */}
              <Stack.Screen name="Main" component={DrawerNavigator} />

              {/* Déclaration des Stacks de rôles au même niveau que le Drawer.
                Cela permet au LoginScreen de faire un navigation.replace('PoliceStack')
              */}
              <Stack.Screen name="AdminStack" component={AdminStack} />
              <Stack.Screen name="PoliceStack" component={PoliceStack} />
              <Stack.Screen name="JudgeStack" component={JudgeStack} />
              <Stack.Screen name="ProsecutorStack" component={ProsecutorStack} />
              <Stack.Screen name="CitizenStack" component={CitizenStack} />
              <Stack.Screen name="ClerkStack" component={ClerkStack} />
              <Stack.Screen name="CommissaireStack" component={CommissaireStack} />
              <Stack.Screen name="LawyerStack" component={LawyerStack} />
            </>
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