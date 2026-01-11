import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet, Alert, Platform } from "react-native";
import { useAuthStore } from "../../stores/useAuthStore";
import { useAppTheme } from "../../theme/AppThemeProvider"; // ✅ Utilisation du Hook
import { goBack } from "../../navigation/RootNavigation"; // ✅ Navigation au lieu de logout

// On suppose que UserRole est défini dans vos types (sinon string[])
import { UserRole } from "../../types/user"; 

type Props = {
  allowed: UserRole[]; // ex: ["admin", "police"]
  children: React.ReactNode;
};

export default function RoleGuard({ allowed, children }: Props) {
  const { user, role, isHydrating } = useAuthStore();
  const { theme } = useAppTheme(); // ✅ Récupération du thème dynamique

  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // 1. Attente du chargement initial
    if (isHydrating) return;

    // 2. Vérification existence utilisateur
    if (!user || !role) {
      setIsAuthorized(false);
      return;
    }

    // 3. Vérification des droits
    // On force le typage ici pour être sûr
    if (allowed.includes(role as UserRole)) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
      handleUnauthorizedAccess();
    }
  }, [role, user, isHydrating, allowed]);

  const handleUnauthorizedAccess = () => {
    const message = `Accès refusé. Cette section est réservée aux profils : ${allowed.join(', ')}.`;

    // On évite de spammer l'alerte sur le Web
    if (Platform.OS !== 'web') {
      Alert.alert(
        "Accès Restreint ⛔",
        message,
        [
          { 
            text: "Retour", 
            onPress: () => goBack(), // ✅ On revient en arrière gentiment
            style: "cancel" 
          }
        ],
        { cancelable: false }
      );
    }
  };

  // 🔄 Chargement
  if (isHydrating || isAuthorized === null) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.statusText, { color: theme.colors.text }]}>
          Vérification des droits...
        </Text>
      </View>
    );
  }

  // 🚫 Accès Refusé (Affichage bloquant si l'alerte est ignorée ou sur Web)
  if (isAuthorized === false) {
    return (
      <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.errorBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.danger || '#EF4444' }]}>
           <Text style={styles.errorIcon}>⛔</Text>
           <Text style={[styles.errorTitle, { color: theme.colors.danger || '#EF4444' }]}>
             ACCÈS INTERDIT
           </Text>
           <Text style={[styles.errorDesc, { color: theme.colors.text }]}>
             Votre profil <Text style={{fontWeight: 'bold'}}>"{role}"</Text> n'a pas les droits nécessaires pour accéder à cette fonctionnalité.
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
    padding: 20
  },
  statusText: {
    marginTop: 15,
    fontSize: 14,
    fontWeight: '600',
  },
  errorBox: {
    padding: 30,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 340,
    // Ombres douces
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 15
  },
  errorTitle: { 
    fontSize: 20, 
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 1,
    textAlign: 'center'
  },
  errorDesc: {
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    opacity: 0.8
  }
});