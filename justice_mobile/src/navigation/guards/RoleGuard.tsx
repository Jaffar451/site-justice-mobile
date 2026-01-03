import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Alert, Platform } from "react-native";
import { useAuthStore } from "../../stores/useAuthStore";
import { getAppTheme } from "../../theme"; // ✅ Utilisation du helper centralisé
import { UserRole } from "../../services/user.service"; // ✅ Typage strict

type Props = {
  allowed: UserRole[]; // ex: ["admin", "police"] - TypeScript validera les rôles ici
  children: React.ReactNode;
};

export default function RoleGuard({ allowed, children }: Props) {
  const { user, role, logout, isHydrating } = useAuthStore();
  const theme = getAppTheme(); // Récupère la couleur du rôle actuel

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Si l'app est encore en train de charger le token, on attend
    if (isHydrating) return;

    // 2. Vérification de sécurité
    if (!user || !role) {
      setIsAuthorized(false);
      return;
    }

    // 3. Vérification du rôle (Alignement strict)
    if (allowed.includes(role as UserRole)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      handleUnauthorizedAccess();
    }
  }, [role, user, isHydrating, allowed]);

  const handleUnauthorizedAccess = () => {
    const message = `Votre rôle actuel (${role}) ne vous permet pas d'accéder à cette section réservée aux : ${allowed.join(', ')}.`;

    if (Platform.OS === 'web') {
      window.alert("Accès Refusé : " + message);
      logout();
    } else {
      Alert.alert(
        "Accès Refusé ⛔",
        message,
        [
          { 
            text: "Retour à l'accueil", 
            onPress: () => logout(), // Ou redirection vers Home
            style: "cancel" 
          }
        ],
        { cancelable: false }
      );
    }
  };

  // 🔄 Chargement (Pendant l'hydratation ou la vérification)
  if (isHydrating || isAuthorized === null) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.color} />
        <Text style={[styles.statusText, { color: theme.color }]}>
          Vérification des habilitations...
        </Text>
      </View>
    );
  }

  // 🚫 Accès Refusé (Écran de blocage visuel)
  if (isAuthorized === false) {
    return (
      <View style={styles.center}>
        <View style={[styles.errorBox, { borderColor: '#EF4444' }]}>
           <Text style={[styles.errorIcon]}>⛔</Text>
           <Text style={[styles.errorTitle]}>ACCÈS INTERDIT</Text>
           <Text style={styles.errorDesc}>
             Vous n'avez pas les droits nécessaires pour voir cette page.
           </Text>
        </View>
      </View>
    );
  }

  // ✅ Accès Autorisé
  return <>{children}</>;
}

const styles = StyleSheet.create({
  center: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: '#F8FAFC',
    padding: 20
  },
  statusText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5
  },
  errorBox: {
    padding: 30,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 300,
    elevation: 5,
    shadowColor: '#EF4444',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  errorIcon: {
    fontSize: 40,
    marginBottom: 10
  },
  errorTitle: { 
    fontSize: 20, 
    fontWeight: "900",
    color: '#991B1B',
    marginBottom: 10,
    letterSpacing: 1
  },
  errorDesc: {
    color: '#7F1D1D',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20
  }
});